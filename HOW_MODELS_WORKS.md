# Models, Database Flow & System Architecture

## 1. Models

| Model | Table | Purpose |
|---|---|---|
| `User` | `users` | Students, alumni, and admin staff — one table, distinguished by `user_type` |
| `RequestService` | `request_services` | Lookup: the six request types a student can submit |
| `RequestStatus` | `request_statuses` | Lookup: the seven pipeline stages a request moves through |
| `CertificateRequest` | `requests` | **The spine.** One row per request a student/alumni submits |
| `InternshipRequestDetail` | `internship_request_details` | 1:1 sidecar, only populated for Internship Certificate requests |
| `RequestStatusHistory` | `request_status_history` | Every status transition a request has gone through — the audit trail |
| `RequestDocument` | `request_documents` | Files tied to a specific request (requirement / verification / output) |
| `AlumniVerification` | `alumni_verifications` | Identity proof (Diploma/TOR), one per alumni user |
| `Faculty` | `faculty` | Read-only, admin-maintained lookup for the consultation-hours search feature |
| `Announcement` | `announcements` | Registrar-posted announcements |
| `Faq` | `faqs` | FAQ entries; also feeds the planned AI inquiry assistant |
| `Feedback` | `feedback` | One-way feedback/suggestions after an inquiry or request |
| `AcademicCalendarFile` | `academic_calendar_files` | The downloadable Academic Calendar |

Plus two package-provided models you don't need to write yourself:
- **`DatabaseNotification`** (Laravel core) — backs the `notifications` table
- **`Activity`** (from `spatie/laravel-activitylog`) — backs the `activity_log` table

> **Note on the `CertificateRequest` name:** this model is deliberately
> named `CertificateRequest`, not `Request` — `Request` collides with
> Laravel's own `Illuminate\Http\Request`, which every controller needs to
> type-hint constantly. Naming it `CertificateRequest` avoids aliasing
> gymnastics in every controller. The table itself is still `requests`
> (set via `protected $table = 'requests';` on the model).

## 2. How the models connect (relationship map)

```
users
  │
  │ 1───* (a user can submit many requests)
  ▼
requests (CertificateRequest) ───*───1 request_services   (what was requested)
  │                            └──*───1 request_statuses    (current status, denormalized)
  │
  ├──1───* request_status_history   (full history of every status change)
  ├──1───0/1 internship_request_details   (only exists for Internship Certificate requests)
  ├──1───* request_documents   (uploaded requirements, verification files, generated output)
  └──1───* feedback   (optional — feedback can be tied to a request, or general)

users ──1───0/1 alumni_verifications   (identity proof, independent of any request)

faculty, announcements, faqs, academic_calendar_files
  → standalone, no direct relationship to requests
```

Two things worth understanding about *why* it's shaped this way, not just
that it is:

- **`requests.status_id` is a snapshot, not the source of truth.** It
  exists purely so dashboards can read "what's the current status" fast,
  without joining against history every time. The actual source of truth
  — used for the audit trail and for reconstructing how a request got
  where it is — is `request_status_history`. These two must always be
  updated together, which is why `CertificateRequest::transitionTo()`
  exists (see §4) rather than updating `status_id` directly anywhere else
  in the codebase.
- **`internship_request_details` only exists for one service type.**
  Rather than adding internship-specific columns (school/agency, semester,
  school year) directly onto `requests` — which would sit NULL for every
  COBC, Course Description, Golden Grain, Alumni Certificate, and
  Scholarship Document Signing request — those fields live in their own
  1:1 table, checked via `$certRequest->service->code ===
  'internship_certificate'`.

## 3. The request lifecycle (the core flow)

Every request, regardless of which of the six services it's for, moves
through the same pipeline:

```
Submitted → For Review → (optional loop: For Compliance → back to For Review) → Processing → Ready for Release → Released
```

`Cancelled/Returned` is a terminal exit state that can branch off from
several points in the pipeline, not just the end.

### What happens at each step, in terms of the models involved

1. **Student submits a request.** A new `CertificateRequest` row is
   created (`user_id`, `service_id`, `delivery_mode`, `purpose`, initial
   `status_id` = Submitted). If the service is Internship Certificate, an
   `InternshipRequestDetail` row is created alongside it in the same flow.
   If the student is an alumnus and hasn't yet verified their identity,
   this is also where an `AlumniVerification` check/upload happens.
2. **Student uploads requirement documents.** One or more
   `RequestDocument` rows are created with `type = requirement`, linked to
   the request.
3. **Registrar reviews the request.** Staff move it through statuses using
   `CertificateRequest::transitionTo()` — e.g. into `For Compliance` if
   something's missing (with a `note` explaining what), which also fires
   off a notification to the student (see §5).
4. **Registrar verifies documents.** `RequestDocument` rows get
   `verified_by` and `verified_at` set; the request itself transitions to
   `Processing`.
5. **Registrar generates/uploads the output.** A `RequestDocument` row
   with `type = output` is created — this is the actual certificate file.
   The request transitions to `Ready for Release`.
6. **Student claims/receives it.** Request transitions to `Released` —
   the terminal, successful end state.
7. **After resolution, the student can leave feedback.** A `Feedback` row
   is created, optionally linked to the request — one-way, no reply from
   the registrar side.

At any point after submission, an admin action (create, update, delete on
a tracked model) is automatically captured by
`spatie/laravel-activitylog` into the `activity_log` table, independent of
the request-specific `request_status_history` — this is the broader,
general-purpose audit trail covering all admin activity, not just status
changes.

## 4. The one method that matters most: `transitionTo()`

```php
public function transitionTo(RequestStatus $newStatus, User $changedBy, ?string $note = null): void
{
    $this->statusHistory()->create([
        'from_status_id' => $this->status_id,
        'to_status_id' => $newStatus->id,
        'changed_by' => $changedBy->id,
        'note' => $note,
    ]);

    $this->update(['status_id' => $newStatus->id]);
}
```

This lives on `CertificateRequest` and is the **only** place that should
ever change a request's status. It does two things atomically from the
caller's perspective: writes a new row to `request_status_history`
(capturing where it came from, where it's going, who did it, and why), and
updates the denormalized `status_id` column to match. Any controller
changing a request's status should call this — never
`$certRequest->update(['status_id' => ...])` directly, since that would
silently break the audit trail.

Example:
```php
$forCompliance = RequestStatus::where('code', 'for_compliance')->firstOrFail();

$certRequest->transitionTo(
    newStatus: $forCompliance,
    changedBy: auth()->user(),
    note: 'Missing internship agency signature'
);
```

## 5. Roles and access

Flat admin — no split between regular registrar staff and a
higher-privileged "release authority" role. Every admin user has identical
access. This is handled via `spatie/laravel-permission`'s `HasRoles` trait
on `User`, checked with `$user->hasRole('admin')` (or the `isAdmin()`
helper already on the model) rather than fine-grained per-permission
checks.

## 6. Notifications and activity logging — how they plug in

- **`notifications`** (Laravel core) — triggered by status transitions and
  other events (e.g. "your certificate is ready for release"). Delivered
  via the database channel (shows up in-app) and optionally mail.
- **`activity_log`** (`spatie/laravel-activitylog`) — auto-logs
  create/update/delete on any model using the `LogsActivity` trait.
  `CertificateRequest` uses it, configured to only log changes to
  `status_id`, `delivery_mode`, and `preferred_claiming_date`, and to skip
  no-op saves and empty log entries.

> **Package version note:** this project uses
> `spatie/laravel-activitylog` **v5** (not v4), which restructured several
> namespaces and renamed a few methods. If you're following an older
> tutorial or v4-era Stack Overflow answer, the imports and method names
> will be wrong. The two that have already bitten us:
> - `Spatie\Activitylog\Traits\LogsActivity` (v4) is now
>   `Spatie\Activitylog\Models\Concerns\LogsActivity` (v5)
> - `Spatie\Activitylog\LogOptions` (v4) is now
>   `Spatie\Activitylog\Support\LogOptions` (v5)
> - `dontSubmitEmptyLogs()` (v4) is now `dontLogEmptyChanges()` (v5)
> - the `$model->activities` relation (v4) is now
>   `$model->activitiesAsSubject` (v5)
>
> If you hit an "unknown class" or "unknown method" warning referencing
> Spatie\Activitylog, check the [official v5 upgrade guide](https://github.com/spatie/laravel-activitylog/blob/main/UPGRADING.md)
> before assuming the code is broken — it's very likely a v4-vs-v5 naming
> mismatch, not an actual bug.

## 7. What's NOT modeled with its own table (by design)

- **Faculty appointment booking** — deliberately absent. `Faculty` is a
  read-only, searchable lookup only (name, department, consultation
  hours, room). There's no relationship from `faculty` to `requests`, no
  booking/scheduling logic, and no faculty-facing portal.


