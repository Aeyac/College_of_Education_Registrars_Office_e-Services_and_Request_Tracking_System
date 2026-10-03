<?php

namespace App\Services;

use App\Models\Faculty;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Decides which `faculty` row a faculty account owns.
 *
 * A single row carries both the admin-maintained schedule and the account
 * profile, so an unlinked row uploaded by the registrar has to be adopted by the
 * matching account instead of being left behind next to a blank duplicate.
 * Matching is name based because that is the only identity the registrar enters
 * when uploading, and it only fires when exactly one unlinked row fits --
 * anything less certain leaves both rows alone for a human to resolve.
 */
class FacultyProfileLinker
{
    /** Titles and honorifics the registrar types but the account never stores. */
    private const HONORIFICS = [
        'dr', 'prof', 'engr', 'eng', 'mr', 'mrs', 'ms', 'miss', 'sir', 'maam',
    ];

    /** Generational suffixes, which also never appear on the account. */
    private const SUFFIXES = ['jr', 'sr', 'ii', 'iii', 'iv'];

    /**
     * Reduce a display name to comparable tokens: lowercase, punctuation split
     * out, honorifics and suffixes dropped, blanks collapsed.
     *
     * @return list<string>
     */
    public static function tokensFor(?string $name): array
    {
        $spaced = preg_replace('/[^a-z0-9]+/i', ' ', (string) $name) ?? '';

        return array_values(array_filter(
            array_map('mb_strtolower', preg_split('/\s+/', trim($spaced)) ?: []),
            fn (string $token) => $token !== ''
                && ! in_array($token, self::HONORIFICS, true)
                && ! in_array($token, self::SUFFIXES, true),
        ));
    }

    /**
     * Every token the account carries must appear in the candidate name. The
     * candidate may carry extra tokens -- the registrar writes middle names and
     * initials the account has no column for -- but the reverse would mean the
     * account knows a name the uploaded schedule does not, which is a different
     * person.
     *
     * @param  list<string>  $accountTokens
     */
    public static function nameMatches(?string $candidateName, array $accountTokens): bool
    {
        $candidateTokens = self::tokensFor($candidateName);

        if ($accountTokens === [] || $candidateTokens === []) {
            return false;
        }

        foreach ($accountTokens as $token) {
            if (! in_array($token, $candidateTokens, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Unlinked rows the account's name fits. More than one means the upload is
     * genuinely ambiguous -- two professors of the same name -- and the caller
     * must not guess.
     *
     * @return EloquentCollection<int, Faculty>
     */
    public function candidatesFor(User $user): EloquentCollection
    {
        $tokens = self::tokensFor($user->fullName());

        if ($tokens === []) {
            return new EloquentCollection;
        }

        return Faculty::query()
            ->whereNull('user_id')
            ->get()
            ->filter(fn (Faculty $faculty) => self::nameMatches($faculty->name, $tokens))
            ->values();
    }

    /**
     * Which of the given rows share a name with a schedule that already belongs to
     * an account, as faculty id => the name it collides with.
     *
     * One query for the whole page: this is a display hint for the admin, and it
     * must not turn the listing into a per-row lookup.
     *
     * @param  Collection<int, Faculty>  $rows
     * @return array<int, string>
     */
    public function claimedCollisions(Collection $rows): array
    {
        $rows = $rows->filter(fn (Faculty $row) => $row->user_id === null)->values();

        if ($rows->isEmpty()) {
            return [];
        }

        $claimed = Faculty::query()
            ->whereNotNull('user_id')
            ->get(['id', 'name']);

        $collisions = [];

        foreach ($rows as $row) {
            $tokens = self::tokensFor($row->name);

            if ($tokens === []) {
                continue;
            }

            foreach ($claimed as $other) {
                $otherTokens = self::tokensFor($other->name);

                // Either side may carry middle names the other lacks, so a name
                // that fits in one direction only still counts as a collision.
                if (self::nameMatches($other->name, $tokens) || self::nameMatches($row->name, $otherTokens)) {
                    $collisions[$row->getKey()] = $other->name;
                    break;
                }
            }
        }

        return $collisions;
    }

    /**
     * The row this account owns, adopting a matching unlinked upload when there
     * is exactly one. An account that already owns a row always keeps it: the
     * faculty member may have edited it, so merging is the admin's call, not
     * this method's.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function resolve(User $user, array $attributes = []): Faculty
    {
        $existing = $user->facultyProfile()->first();

        if ($existing) {
            return $existing;
        }

        $candidates = $this->candidatesFor($user);

        if ($candidates->count() === 1) {
            return $this->claim($candidates->first(), $user);
        }

        return Faculty::create(array_merge($attributes, [
            'user_id' => $user->id,
            'name' => $user->fullName(),
            'role' => 'Not specified',
            'department_or_program' => 'Not specified',
            'room_or_location' => 'Not specified',
            'weekly_schedule' => [],
        ]));
    }

    /**
     * The one row an upload of this name should land on, or null when none or
     * several rows fit.
     *
     * This is what makes re-uploading the same professor's schedule an update
     * rather than a second card. An unlinked row is preferred over a linked one:
     * the loose upload is the row still waiting to be adopted, while the linked
     * row already has an owner who may have edited it. Several matches is treated
     * as no match on purpose -- with two professors of the same name on file, the
     * admin picks the row by hand.
     */
    public function uniqueMatchForUpload(?string $name): ?Faculty
    {
        return $this->singleNameMatch($name, onlyUnlinked: true)
            ?? $this->singleNameMatch($name, onlyUnlinked: false);
    }

    /**
     * The single row whose name covers the given name, narrowed to linked or
     * unlinked rows. Returns null unless the match is unambiguous.
     */
    private function singleNameMatch(?string $name, bool $onlyUnlinked): ?Faculty
    {
        $tokens = self::tokensFor($name);

        if ($tokens === []) {
            return null;
        }

        $query = Faculty::query();

        $onlyUnlinked
            ? $query->whereNull('user_id')
            : $query->whereNotNull('user_id');

        $matches = $query->get()
            ->filter(fn (Faculty $faculty) => self::nameMatches($faculty->name, $tokens))
            ->values();

        return $matches->count() === 1 ? $matches->first() : null;
    }

    /**
     * The row to show on a read-only page.
     *
     * Same adoption as resolve(), but it never creates: a GET must not leave a
     * row behind, and a professor who has no matching upload is perfectly able
     * to see an empty form.
     */
    public function adoptForDisplay(User $user): ?Faculty
    {
        $existing = $user->facultyProfile()->first();

        if ($existing) {
            return $existing;
        }

        $candidates = $this->candidatesFor($user);

        return $candidates->count() === 1 ? $this->claim($candidates->first(), $user) : null;
    }

    /**
     * Adopt a freshly uploaded row on behalf of the account it names.
     *
     * The registrar can upload a schedule months before the professor is given
     * an account, so the upload side needs this too. Only an account that has
     * not been given a row of its own is eligible, and only when exactly one
     * such account fits.
     */
    public function adoptMatchingAccount(Faculty $faculty): ?Faculty
    {
        // Never re-point a row that already has an account; that is the link or
        // unlink action's job, not something an upload should do behind its back.
        if ($faculty->user_id !== null) {
            return null;
        }

        $matches = User::query()
            ->where('user_type', 'faculty')
            ->whereDoesntHave('facultyProfile')
            ->get()
            ->filter(fn (User $user) => self::nameMatches($faculty->name, self::tokensFor($user->fullName())))
            ->values();

        return $matches->count() === 1 ? $this->claim($faculty, $matches->first()) : null;
    }

    /**
     * Attach a row to an account on the admin's instruction. Unlike the
     * automatic path this is never ambiguous, so it is guarded only against
     * handing one account a second row or taking a row that is already spoken for.
     */
    public function link(Faculty $faculty, User $user): Faculty
    {
        if ($faculty->user_id !== null && $faculty->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'user_id' => 'That schedule is already linked to another faculty account.',
            ]);
        }

        $owned = $user->facultyProfile()->first();

        if ($owned && $owned->getKey() !== $faculty->getKey()) {
            throw ValidationException::withMessages([
                'user_id' => $user->fullName().' already has a schedule of their own. Unlink that one first.',
            ]);
        }

        return $this->claim($faculty, $user);
    }

    /**
     * Hand the row back to the registrar. The schedule stays visible to
     * everyone; only the account's claim on it goes away.
     */
    public function unlink(Faculty $faculty): Faculty
    {
        $faculty->update([
            'user_id' => null,
            'last_edited_by' => null,
            'edited_by_role' => null,
        ]);

        return $faculty;
    }

    /**
     * Record who last changed the shared row, so the faculty portal can say the
     * edit came from the registrar and not from them.
     */
    public function stamp(Faculty $faculty, ?User $editor, string $role): Faculty
    {
        $faculty->update([
            'last_edited_by' => $editor?->id,
            'edited_by_role' => $role,
        ]);

        return $faculty;
    }

    /**
     * Claim inside a transaction with the row locked, so two accounts created in
     * the same moment cannot both walk away thinking they own the same upload.
     * The unique index on faculty.user_id is the backstop if this is ever bypassed.
     */
    private function claim(Faculty $faculty, User $user): Faculty
    {
        return DB::transaction(function () use ($faculty, $user): Faculty {
            $claimed = Faculty::query()
                ->whereKey($faculty->getKey())
                ->lockForUpdate()
                ->sole();

            $claimed->update(['user_id' => $user->id]);

            return $claimed;
        });
    }
}
