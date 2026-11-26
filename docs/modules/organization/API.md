# Organization — API contracts

**Current implementation:** none. `apps/api/src/modules/organization/organization.module.ts` is an empty NestJS module, and `packages/contracts` has no schemas.

**Proposed design:** the REST API below, served by the Organization module in `apps/api`, backed by the tables in [Organization database schema](DATABASE-SCHEMA.md) and the [data architecture decision](../../project/DATA-ARCHITECTURE.md). Endpoints follow what the [UI prototype](UI-PROTOTYPE.md) already shows.

**Known limitations:** authentication is owned by the Identity module and only summarized here. Email delivery, rate limits and API versioning beyond `/v1` are not designed in detail.

## Conventions

- Base path `/api/v1`. JSON in and out. Field names in `camelCase`.
- The organization comes from the signed-in session, never from the URL, so one organization cannot address another's data.
- Lists use cursor pagination: `?limit=50&cursor=…`, response `{ items, nextCursor }`.
- Errors use one shape: `{ error: { code, message, fields? } }`, where `fields` maps form fields to messages.
- Every change writes an audit event in the same transaction.
- Request and response schemas live in `packages/contracts` (zod), so the web app and API share types.
- Access: **Admin** means an organization administrator. Other roles are noted.

## Endpoints

### Account (Identity module, listed for context)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/signup` | Create the first administrator and an empty organization |
| POST | `/auth/verify-email` | Confirm the 6-digit code |
| POST | `/auth/login`, `/auth/logout` | Session cookie (httpOnly) |
| POST | `/auth/password-reset`, `/auth/password-reset/confirm` | Reset by email link |

### Organization and settings

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/organization` | Any member | Name, type, location; shown in the sidebar |
| PATCH | `/organization` | Admin | Onboarding step 1 and Settings profile |
| GET | `/organization/settings` | Admin | Dates, invitations, security, evidence |
| PATCH | `/organization/settings` | Admin | Settings "Save changes" |
| GET | `/organization/setup-status` | Admin | Steps done, and the "needs attention" list for the bell |

### Departments

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/departments` | Any member | List with people counts |
| POST | `/departments` | Admin | Add |
| PATCH | `/departments/{id}` | Admin | Rename, recolor, change code |
| POST | `/departments/reorder` | Admin | Body: ordered list of ids |
| POST | `/departments/{id}/archive` | Admin | Only when no active people remain, or with a target department to move them to |

### People and reviewers

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/people` | Admin; reviewers see only their reviewees | Filters: `departmentId`, `role` (`reviewer`, `member`), `status`, `noReviewer=true`, `q` (name or email) |
| GET | `/people/{id}` | Admin, the person, or their reviewer | |
| POST | `/people` | Admin | Add one person |
| PATCH | `/people/{id}` | Admin | Name, email, title, department, `isReviewer` |
| PUT | `/people/{id}/reviewer` | Admin | Body `{ reviewerId }`; ends the current assignment and starts a new one |
| POST | `/people/{id}/deactivate`, `/people/{id}/reactivate` | Admin | No hard delete |

Rules enforced by the API: a reviewer must have `isReviewer`, nobody reviews themselves, and turning off `isReviewer` is refused while that person still has reviewees (the response lists them).

### CSV import

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/people/imports` | Admin | Returns a signed upload URL and a job id |
| POST | `/people/imports/{jobId}/validate` | Admin | Checks every row; result in `summary` |
| GET | `/people/imports/{jobId}` | Admin | Status, counts, row errors |
| POST | `/people/imports/{jobId}/apply` | Admin | Creates the valid rows in one transaction |

Columns: `full_name`, `email`, `job_title`, `department` (name or code), `reviewer_email`, `is_reviewer`.

### Invitations

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/invitations` | Admin | Filter by `status`; counts per status for the tabs |
| POST | `/invitations/send` | Admin | Send to everyone not yet invited (setup "Send N invitations") or to listed people |
| POST | `/invitations/{id}/resend` | Admin | New token, old one stops working |
| POST | `/invitations/resend` | Admin | Bulk resend, body: ids |
| POST | `/invitations/{id}/revoke` | Admin | |
| GET | `/public/invitations/{token}` | Public | Who invited them, organization, department, title; or `expired` |
| POST | `/public/invitations/{token}/accept` | Public | Name and password; creates the user account and signs them in |

Emails are queued through an outbox table and sent by a worker, so a slow mail provider never blocks the request. Failed sends set the invitation to `failed` with the reason.

## Build order

1. Database, ORM and migrations; `packages/contracts` set up; error and pagination helpers; audit helper.
2. Identity: sign-up, verify, login, sessions.
3. Organization, settings, departments.
4. People and reviewer assignments.
5. Invitations, outbox and email; public accept flow.
6. CSV import jobs.
7. Web app: replace the prototype's browser store with API calls behind the same hooks, one screen at a time.

Each step ships as its own Issue and PR with integration tests against a real Postgres.
