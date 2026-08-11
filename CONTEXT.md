# WRCIMS — CED Registrar's Office Certificate & Request Management System

## 1. What this system is

WRCIMS (originally scoped as WFCIMS, then narrowed and renamed per the client's
formal revision) is a web application built for the **College of Education (CED)
Registrar's Office** at Central Luzon State University. What started as a
capstone case study is now being built for **real deployment**, targeting a
**November go-live** with real students, alumni, and registrar staff.

It replaces the office's manual, walk-in-heavy process for requesting
certificates and documents with an online system that lets students and
alumni submit requests, track their status, and get notified as things
progress — while giving registrar staff a dashboard, an audit trail, and
report generation instead of paper records.

### Who uses it
Only two roles exist — there is no separate faculty-facing role:
- **CED Registrar staff/admin** — flat admin access, no split between
  regular staff and a higher "release authority" tier.
- **CED students and alumni** — alumni must upload a Diploma or TOR to
  verify they're a CLSU graduate before their requests are processed.

### Why it exists (the actual problem being solved)
During requirements elicitation, the Product Owner (the Head University
Registrar) identified that the office was overwhelmed by repetitive
requests and inquiries, students had no reliable way to track request
status (causing repeated follow-ups), there were real concerns about data
confidentiality and admin accountability, and the system needed to handle
5,000+ students/alumni especially during enrollment week and graduation
clearance. Every major design decision below traces back to one of these
problems.

## 2. Scope

### Services the system handles
The system accommodates six request types (this is the full list from the
client's service catalog — all confirmed in scope, not just certificates):
- Internship Certificate / PT Certificate
- Request for Copy of COBC
- Course Description
- Golden Grain (Yearbook)
- Alumni Certificate Request
- Scholarship Document Signing

Documents can be requested as **soft copy or hard copy**. The Registrar's
office only provides a limited set of documents (unlike the wider OAD), and
**no payment feature is needed** — document requests are free.

Faculty Consultation Hours are also in scope, but strictly as a **read-only
search/view feature** — students can look up when a faculty member is
available, but there is no appointment booking, scheduling, or faculty
portal. Full faculty appointment/scheduling functionality was explicitly
removed by the client.

### Explicitly out of scope
- Full faculty consultation *booking/scheduling* (view/search only survives)
- Any payment processing
- TOR requests, Good Moral Certificate, and Certificate of Enrollment as
  their own standalone request types
- The old "Transactions" module
- Anything handled by university-level Admissions or the main Registrar
  rather than the CED Registrar's Office specifically

### Other confirmed features
- Announcement module
- Feedback/suggestion form after every inquiry or request (one-way —
  students submit, registrar reads via dashboard, no reply workflow)
- Downloadable Academic Calendar
- Automated replies that distinguish "needs follow-up" vs. "no further
  action needed"
- College of Education Philosophy replacing the generic Mission/Vision
  content
- Support for users without a CLSU email account
- Privacy Policy and Terms of Service
- Audit trail / activity log for accountability
- Report generation for the registrar (requests received, pending,
  released, returned, common concerns, processing status per month/semester)

### Branding
Official CLSU/CED colors (green/gold), formal academic look — deliberately
avoiding a generic commercial-app aesthetic.

### Deliverables owed to the client at handover
Source code, database design, admin credentials, user manual, technical
manual, deployment guide, backup instructions, and a written
agreement/conforme stating the customized system and office data can't be
sold, transferred, reused, or redeployed elsewhere without written
permission.

## 3. Tech stack

**Laravel + Inertia.js + React + MySQL** — a single modular monolith rather
than a separate API + decoupled SPA. This was chosen because there's no
mobile app in scope, and Inertia gives a full React UI without the
auth/CORS/dual-deployment overhead a decoupled setup would add under a
tight deadline.

- **Laravel app server** — HTTP layer (routes, controllers, RBAC), plus
  queue workers for anything slow (notifications, file processing)
- **MySQL** — core data store
- **Redis** — cache + queue driver + sessions
- **File storage** — uploaded requirement/verification documents, alumni
  verification proofs, generated certificates
- **Laravel Octane** — for production throughput
- **Hosting target** — a single well-specced VPS (Hetzner/DigitalOcean,
  ~$20–40/mo tier); horizontal scaling deferred until actually needed,
  sized for realistic burst load (enrollment week, graduation clearance)
  rather than worst-case theoretical concurrency at 5,000 concurrent users

## 4. The request lifecycle

Every request moves through the same status pipeline, regardless of which
of the six services it's for:

```
Submitted → For Review → (optional: For Compliance → back to For Review) → Processing → Ready for Release → Released
```

**Cancelled/Returned** is a terminal exit state that can branch off at
various points in the pipeline. This state machine is the spine of the
whole system — nearly every other feature (notifications, dashboard
counts, report generation, audit log) is built around tracking a request's
position in this pipeline and how it got there.

## 5. Database design

### Design philosophy
Rather than one wide table trying to hold every concern, the schema splits
by "what happens once vs. what happens repeatedly" and "what's shared vs.
what's specific to one service type." This is normalization for concrete
reasons, not tidiness for its own sake:
- **Sparse columns avoided** — only Internship Certificate requests need
  fields like internship school/agency or semester/school year. Those live
  in their own sidecar table instead of sitting NULL on every other
  request row.
- **Data integrity** — a sidecar table can enforce NOT NULL on its own
  fields without those constraints leaking into unrelated request types.
- **History isn't optional** — the client explicitly requires an audit
  trail of every status change (who changed it, when, why), which by
  definition can't be columns on a one-row-per-request table — it needs
  its own many-rows-per-request table.
- **Reporting clarity** — normalized tables make "count requests by
  service type this month" or "average time spent in For Compliance"
  straightforward joins instead of painful queries against one giant
  mixed-concern table.

### Core tables

**`users`** (Laravel's default table, extended)
Holds students, alumni, and admin staff in one table, distinguished by
`user_type`. Extra fields: `student_number`, `program`,
`year_level_or_batch`, `contact_number`. Soft-deleted, never hard-deleted.

**`request_services`** (lookup table)
The six request types (`code`, `label`, `sort_order`). `code` is the
machine-readable value app logic checks against (e.g. deciding whether to
show internship-specific form fields); `label` is what renders in the UI.
`sort_order` controls display order in dropdowns/lists — without it,
MySQL's natural row order isn't guaranteed, and it lets staff reorder the
list later without a code change.

**`request_statuses`** (lookup table)
The seven pipeline stages (`code`, `label`, `sort_order`) — a lookup table
rather than a MySQL `ENUM` column, so statuses stay editable without a
migration.

**`requests`** (the spine of the whole system)
One row per request. Points to `users` (who made it), `request_services`
(what they asked for), and `request_statuses` (current status —
denormalized here for fast dashboard reads, while the full history lives
separately). Also holds `delivery_mode` (soft/hard copy),
`preferred_claiming_date`, and `purpose`. Soft-deleted — registrar records
must persist.

**`internship_request_details`** (1:1 sidecar, only for Internship
Certificate requests)
Holds the fields unique to that one service type: internship
school/agency, grade level handled, semester, school year. Kept separate
so these columns aren't sparse/NULL on every non-internship request.

**`request_status_history`** (the audit trail for the compliance loop)
One row per status transition: `from_status_id`, `to_status_id`,
`changed_by`, `note`, timestamp. This is the source of truth satisfying
the client's accountability requirement — `requests.status_id` is just a
fast-read snapshot of whatever the latest row here says.

**`request_documents`**
Files tied to a specific request — `type` distinguishes `requirement`
(student-submitted), `verification` (internal check artifact), or `output`
(the final generated certificate). Stores a file `path`, not the file
itself — the actual bytes live in file storage, the database just points
to them.

**`alumni_verifications`**
Identity proof (Diploma or TOR), one per alumni user — separate from
`request_documents` because this is about *who the user is*, not what a
specific request needs. Has its own `status` (pending/verified/rejected)
independent of any request's status.

### Feature-support tables

**`faculty`** — read-only, admin-maintained lookup for the consultation-
hours search feature. No relation to `requests` at all; no faculty portal.

**`announcements`** — title, body, publish/expiry timestamps, posted by an
admin user.

**`faqs`** — question/answer pairs with a category and sort order; feeds
the FAQ page and, prospectively, the AI inquiry assistant (see §7).

**`feedback`** — one-way only, by design: a rating and/or comment tied to
a user (and optionally a specific request), with no reply column or
workflow — the registrar reads it via dashboard, doesn't respond in-system.

**`academic_calendar_files`** — the downloadable Academic Calendar,
versioned by school year with an `is_current` flag.

### Cross-cutting, package-provided tables (not hand-written)
- **`notifications`** (Laravel built-in, via `php artisan
  notifications:table`) — polymorphic table backing in-app + email
  notifications like "your certificate is ready for release." Works the
  same in every environment (local/staging/production) once migrated
  there.
- **`activity_log`** (from `spatie/laravel-activitylog`) — auto-logs
  create/update/delete activity on any model using the `LogsActivity`
  trait, capturing who did what and when. This is the general audit log
  sitting alongside the more purpose-built `request_status_history`.
- **Roles/permissions tables** (from `spatie/laravel-permission`) — since
  RBAC is flat-admin-only here, this is used lightly: a single `admin`
  role via the `HasRoles` trait on `User`, checked with `hasRole('admin')`
  rather than fine-grained per-permission gates.

### Relationships, in short
```
users 1---* requests
requests *---1 request_services
requests *---1 request_statuses (current status)
requests 1---* request_status_history
requests 1---0/1 internship_request_details
requests 1---* request_documents
requests 1---* feedback (optional link)
users 1---0/1 alumni_verifications
```

### Indexes
Composite indexes on `requests(status_id, created_at)` and
`requests(service_id, created_at)` for dashboard/report queries, and
`request_status_history(request_id, created_at)` for pulling a request's
full timeline efficiently.

## 6. Roles and access

Flat admin model — every admin user has identical access and permissions;
there's no split between regular registrar staff and a higher
"release authority" tier. Students/alumni only see their own requests and
data; admins see everything within the CED Registrar scope.

## 7. Possible AI feature

To satisfy the course requirement for at least one AI feature, the current
plan is an **AI-powered FAQ/inquiry assistant**: a chat widget where
students ask a question in plain language, the system retrieves relevant
content from `faqs` and `announcements`, and an LLM generates a
conversational answer grounded only in that retrieved content — explicitly
declining to guess and offering to escalate to a real inquiry (auto-filling
the form) when it can't answer confidently.

This was chosen because it directly addresses the client's own stated pain
point — the office being overwhelmed by repetitive inquiries — making it
easy to justify in a defense, and because retrieval can start simple
(MySQL full-text/keyword search over the existing `faqs`/`announcements`
tables) without requiring a vector database, given the FAQ set is small.

## 8. Where things stand

Schema decisions are agreed and 13 migration files have been written
covering everything in §5 except the two package-provided tables
(`notifications`, `activity_log`), which come from their own Composer
packages. Next steps: install `spatie/laravel-permission` and
`spatie/laravel-activitylog`, run all migrations, then build the Eloquent
models (relationships, `HasRoles` on `User`, `LogsActivity` on `Request`)
and seeders for `request_services` and `request_statuses`.