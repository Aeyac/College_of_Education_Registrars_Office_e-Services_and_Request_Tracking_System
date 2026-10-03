<?php

namespace App\Console\Commands;

use App\Models\Faculty;
use App\Models\User;
use App\Services\FacultyProfileLinker;
use Illuminate\Console\Command;

/**
 * Repair schedules the registrar uploaded before the professor had an account.
 *
 * Rows are only linked when exactly one account fits the name, so a rerun after
 * more uploads land is safe, and an ambiguous pair is reported instead of
 * guessed at.
 */
class LinkFacultySchedules extends Command
{
    protected $signature = 'faculty:link-schedules
                            {--dry-run : Report what would be linked without writing anything}';

    protected $description = 'Link unlinked faculty schedules to the faculty accounts that match them';

    public function handle(FacultyProfileLinker $linker): int
    {
        $unlinked = Faculty::query()
            ->whereNull('user_id')
            ->orderBy('id')
            ->get(['id', 'name']);

        if ($unlinked->isEmpty()) {
            $this->components->info('Every faculty schedule is already linked.');

            return self::SUCCESS;
        }

        $accounts = User::query()
            ->where('user_type', 'faculty')
            ->whereDoesntHave('facultyProfile')
            ->get(['id', 'first_name', 'last_name', 'email']);

        $linked = 0;
        $ambiguous = [];

        foreach ($unlinked as $faculty) {
            $matches = $accounts->filter(
                fn (User $user) => FacultyProfileLinker::nameMatches(
                    $faculty->name,
                    FacultyProfileLinker::tokensFor($user->fullName()),
                )
            )->values();

            if ($matches->count() !== 1) {
                if ($matches->count() > 1) {
                    $ambiguous[] = [$faculty, $matches];
                }

                continue;
            }

            $account = $matches->first();

            if ($this->option('dry-run')) {
                $this->components->twoColumnDetail(
                    (string) $faculty->name,
                    '<fg=yellow>would link to</> '.$account->fullName().' <fg=gray>('.$account->email.')</>',
                );
            } else {
                $linker->link($faculty, $account);
                $this->components->twoColumnDetail(
                    (string) $faculty->name,
                    '<fg=green>linked to</> '.$account->fullName().' <fg=gray>('.$account->email.')</>',
                );
            }

            $linked++;
        }

        if ($ambiguous !== []) {
            $this->newLine();
            $this->components->warn('Skipped, because more than one account fits the name:');

            foreach ($ambiguous as [$faculty, $matches]) {
                $this->components->twoColumnDetail(
                    (string) $faculty->name,
                    '<fg=yellow>candidates:</> '.$matches->map(fn (User $u) => $u->fullName().' <fg=gray>('.$u->email.')</>')->implode(', '),
                );
            }

            $this->components->twoColumnDetail(
                'Resolve these',
                'from the faculty schedules page',
            );
        }

        $this->newLine();

        $verb = $this->option('dry-run') ? 'would be linked' : 'linked';

        $this->components->info($linked.' schedule(s) '.$verb.' out of '.$unlinked->count().' unlinked.');

        return self::SUCCESS;
    }
}
