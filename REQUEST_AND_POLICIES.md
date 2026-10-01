# Form Requests & Policies

## Form Requests included
- **`StoreCertificateRequestRequest`** — validates a new request
  submission. Internship-specific fields (`internship_school_or_agency`,
  `semester`, `school_year`) are only required when the submitted
  `service_id` resolves to the `internship_certificate` service code —
  resolved dynamically via `RequestService::find()`, not a hardcoded ID,
  so it survives reseeding.
- **`UpdateCertificateRequestStatusRequest`** — validates admin status
  transitions. Requires a `note` specifically when moving into
  `For Compliance` or `Cancelled/Returned`, so staff can't skip
  explaining those.
- **`StoreRequestDocumentRequest`** — validates file uploads
  (requirement/verification/output), capped at 10MB, PDF/JPG/PNG only.
- **`StoreAlumniVerificationRequest`** — validates Diploma/TOR uploads,
  restricted to `user_type = alumni`.
- **`StoreFeedbackRequest`** — validates one-way feedback submission,
  optional rating (1-5) and comments, optionally tied to a request.

None of these call `transitionTo()` or touch models directly — they only
validate + authorize. The actual model changes happen in controllers,
which is where `transitionTo()` gets called using the validated
`status_code` from `UpdateCertificateRequestStatusRequest`.

## Policies included
All follow the flat-admin shape already decided for this project — no
split between regular staff and release authority:

- **`CertificateRequestPolicy`** — students/alumni can view and manage
  documents on their own requests only; admins can do everything,
  including the dedicated `transitionStatus()` ability used specifically
  for pipeline moves (kept separate from generic `update()` so a
  controller can authorize "can move this request's status" distinctly
  from "can edit this request's fields").
- **`AlumniVerificationPolicy`** — alumni upload their own proof; only
  admins can `review()` (mark verified/rejected).
- **`FeedbackPolicy`** — students/alumni create, admins view. No
  `update()`/`delete()` defined at all, on purpose — feedback is
  immutable once submitted, matching the one-way, no-reply requirement.
- **`AnnouncementPolicy`** — everyone reads, only admins manage. Use this
  one's structure as the template for `FacultyPolicy`, `FaqPolicy`, and
  `AcademicCalendarFilePolicy` when you get to those — they're all the
  identical shape, just not written out three more times here to avoid
  redundant boilerplate.

