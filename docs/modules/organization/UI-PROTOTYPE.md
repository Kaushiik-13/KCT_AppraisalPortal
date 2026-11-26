# Organization — UI prototype and design reference

## Status

**Current implementation:** a clickable, **nonfunctional design prototype** of the Organization onboarding screens and the first signed-in administrator screens in `apps/web` (Issue #69). It has no backend, no authentication, no email, no database and no validation. Data lives in React state and is kept only in the browser tab's `sessionStorage` so the flow can be demonstrated across pages. It is **not** a production onboarding flow and must not be described as one.

**Proposed design:** the screens, field sets, colors and components below are proposals for review. They are not approved contracts for data, API or permissions.

**Known limitations:** see [Known limitations and deviations](#known-limitations-and-deviations).

## How to run it

```powershell
npm install
npm run dev --workspace @afpi/web -- -p 5173 -H 127.0.0.1
```

Open `http://127.0.0.1:5173/signup`. On Windows PowerShell, if `npm` is blocked by the execution policy, run `npm.cmd` instead of `npm`.

## Screens built

| Order | Route | Screen | What the prototype shows |
|---|---|---|---|
| 1 | `/signup` | Create administrator account | Name, work email, password with show/hide. No validation. |
| 2 | `/signup/verify` | Verify email | Six-digit code boxes (auto-advance, paste, backspace), resend countdown, "use a different email". Any code works. |
| 3 | `/setup/organization` | Organization details | Name, type (any kind of organization), number of employees, country, city, website, contact email, phone, logo drop area, live preview, "what happens next". |
| 4 | `/setup/departments` | Departments (optional) | Add, edit inline, delete, drag or keyboard reorder, quick-add suggestions, one light accent color per department, live people count. |
| 5 | `/setup/employees` | Employees | List grouped by department; add-employee popup; **per-department import popup** with drag and drop; move person between departments; remove; search. |
| 6 | `/setup/roles` | Roles and reviewers | Two clearly separated steps: (1) choose who can review others, (2) assign a reviewer to each person with bulk select and a "without a reviewer" filter. Step 2 is locked until a reviewer exists. |
| 7 | `/setup/configuration` | Configuration | Dates and locale, invitations and email, access and security, evidence and data (see [Configuration fields](#configuration-fields-prototype)). |
| 8 | `/setup/review` | Review and finish | Non-blocking checks with Fix links, a summary of every step with Edit links, and a confirmation popup before "Send invitations". After sending, a result list shows each person as Invited. "Start the demo over" resets the prototype. Nothing is actually sent. |

The setup screens (3 to 8) share one layout: a title ("Organization onboarding"), a left vertical stepper, and Back and Continue buttons. `/` redirects to `/signup`.

### Signed-in screens

| Route | Screen | What the prototype shows |
|---|---|---|
| `/login` | Log in | Work email, password with show/hide, "keep me signed in", link to reset and to sign up. Log in goes to `/home`. |
| `/forgot-password` | Reset password | Email field, then a "Check your email" state with "use a different email". |
| `/accept-invitation` | Accept invitation | Sample invitation (organization, who invited, email, department, job title), name and password. Submit goes to `/login`. |
| `/accept-invitation/expired` | Expired invitation | Message to ask the administrator for a new link. |
| `/home` | Home | KPI tiles (completion, average score, reviews pending, participation), average score by cycle (line), review status (stacked bar), average score by department (bars). |
| `/invitations` | Invitations | Status filters with counts, search, table with status dot and detail, Resend or Retry per row, light bulk-resend bar. A banner links to the Review step if nothing has been sent. |
| `/people` | People (with departments) | One page for people and departments. A department list on the left (live counts, add a department, a "No reviewer" shortcut) filters one table on the right. Active and Deactivated tabs, role filter, search, a reviewer picker in each row, edit dialog, Deactivate or Reactivate, Add person (opens with the selected department), Import CSV (reuses the setup import popup; into the selected department, or a menu of departments when "All people" is selected). |
| `/settings` | Settings | Left list of sections (Organization profile, Dates and locale, Invitations and email, Access and security, Evidence and data). Edits are held as a draft; a Save bar with Save changes and Discard appears only when something changed, and shows "Saved" afterwards. Reuses the setup Configuration controls (date format is a dropdown here). |

There are no separate Departments or Roles and reviewers pages after setup: departments and reviewer assignment live on People. The sidebar is Home, People, Invitations, Settings.

**App shell** (`apps/web/app/(app)/layout.tsx`, wraps the signed-in routes): left sidebar with the organization name and type at the top, navigation, a setup-progress block (becomes "Setup complete" at the end; the Roles step counts as done only when everyone who needs a reviewer has one) and the user menu (profile placeholder, log out) at the bottom; a rigid layout (the sidebar and top bar stay fixed; only the page body scrolls), a top bar with a breadcrumb, a search box (Ctrl K focuses it; it searches nothing), an appraisal-cycle selector (changes nothing) and a bell listing "needs attention" items with actions; "Powered by AFPI" fixed at the bottom right. On a phone the sidebar becomes a top bar with four tabs, and the setup stepper becomes a progress bar with the current step name.

**Sample data.** Appraisal scores, review counts, trends, department scores, invitation outcomes (Joined, Invited, Expired, Failed are cycled across people after "Send invitations") and the cycle list are fixed sample values. They stand in for data that Framework Studio and a real invitation service would provide. When setup is fully complete the prototype shows everyone as joined. The people counts, departments, reviewers and setup progress come from the setup data in `sessionStorage`. Deactivation on the People screen lives in page memory only and is lost on reload.

The charts are hand-drawn SVG and CSS bars. No charting library was added; one (for example the shadcn chart component on `recharts`) can replace them if reviewers prefer.

The earlier prototype (institution wording, six onboarding steps, setup home, simulations panel) was discarded in favor of this version. Its history remains in the branch's first commit.

## Design system as used (provisional)

Direction chosen for review: **dense and utilitarian**. Flat lists instead of stacked cards, thin 1px borders instead of shadows, small tight type, one accent color, and color used for status and selection only.

### Color tokens

Defined in `apps/web/app/globals.css` as shadcn semantic tokens. Components must use tokens, not raw hex.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#FAFAFA` | `#0E0F11` | Page |
| `--card` / `--popover` | `#FFFFFF` | `#141517` | Panels, dialogs |
| `--foreground` | `#111418` | `#ECEDEE` | Text |
| `--muted-foreground` | `#6B7280` | `#8B8F97` | Supporting text |
| `--primary` / `--ring` | `#2F54EB` | `#6B8AFF` | Main action, selection, focus |
| `--secondary` / `--muted` / `--accent` | `#F4F4F5` | `#1C1D20` | Hover and quiet fills |
| `--border` / `--input` | `#E4E4E7` | `#26282C` | Lines |
| `--destructive` | `#B91C1C` | `#F87171` | Errors, delete |
| `--success` | `#15803D` | `#4ADE80` | Done, joined |
| `--warning` | `#B45309` | `#FBBF24` | Needs attention |
| `--info` | `#2F54EB` | `#6B8AFF` | Invited, in progress |

`--success`, `--warning` and `--info` (and their foregrounds) are provisional additions; the shared status-color decision is tracked in `docs/project/UI-UX.md`. The dark tokens exist and apply when the `dark` class is set on the page, but dark mode has only had a spot check (see [Testing](TESTING.md)) and the prototype has no theme toggle.

### Department accent colors

Eight light tints with dark text (each pair at least 4.5:1 contrast), in `apps/web/lib/department-colors.ts`:

| Key | Background | Text |
|---|---|---|
| indigo | `#E0E7FF` | `#3730A3` |
| blue | `#DBEAFE` | `#1E40AF` |
| teal | `#CCFBF1` | `#115E59` |
| green | `#DCFCE7` | `#166534` |
| amber | `#FEF3C7` | `#92400E` |
| rose | `#FFE4E6` | `#9F1239` |
| purple | `#F3E8FF` | `#6B21A8` |
| slate | `#E2E8F0` | `#334155` |

The color is a visual aid only. Information must never depend on color alone; the department name is always shown with it. These tints are fixed hex values and do not yet adapt to dark mode.

### Typography, shape and spacing

- Font: Geist through `next/font/google`.
- Sizes: page title `text-2xl`, step heading `text-xl`, section heading `text-base`, body and table text `text-sm`, captions `text-xs`.
- Corners: `--radius` is `0.375rem`; controls use `rounded-lg`, small tags use `rounded-[4px]`.
- Separation by borders and whitespace. No decorative shadows or gradients.

### Visual rules used across screens

1. One accent. The blue is used only for the primary action, selection and focus.
2. Status is shown as a small colored dot plus text, not as a colored pill.
3. Group repeated items with headings and dividers instead of one card per item.
4. Selection toolbars are light (tinted), not dark.
5. Every icon-only button has an `aria-label`. Decorative icons are `aria-hidden`.

## Components

### shadcn/ui primitives used (`apps/web/components/ui`)

`button`, `input`, `label`, `select`, `switch`, `dialog`, `alert-dialog`, `card`, `dropdown-menu`, `checkbox`, `badge`.

Installed from shadcn but **not currently used**: `alert`, `progress`, `radio-group`, `separator`, `sheet`, `skeleton`, `table`, `tabs`, `textarea`, `tooltip`. They can be pruned before a PR if reviewers prefer.

### Prototype components (`apps/web/components`)

| Component | Purpose |
|---|---|
| `brand.tsx` | AFPI mark and name |
| `color-picker.tsx` | Row of small light swatches (radio group) for a department color |
| `add-employee-dialog.tsx` | Add-employee popup with "add and add another" |
| `lib/admin-user.ts`, `lib/setup-progress.ts` | Prototype hooks: the signed-in person (from sign-up, with a sample fallback) and the setup-progress and needs-attention list |
| `import-employees.tsx` | Per-department drag and drop import popup (setup and People) |
| `settings-rows.tsx` | `Section`, `Row`, `Pick`, `Toggle`, `Segmented`: shared by the setup Configuration step and Settings |
| `page-header.tsx`, `search-field.tsx`, `status-tabs.tsx` | Page title block with actions, search box, filter tabs (soft or underline style) |
| `person-avatar.tsx`, `department-chip.tsx`, `status-dot.tsx`, `table-empty.tsx` | Initials badge, department tag, dot and label, empty table row |
| `stat-tile.tsx` | `StatTile`, `StatGrid`, `Panel` used by Home |

### Libraries and justification

| Package | Why |
|---|---|
| `radix-ui` | Accessible primitives under shadcn/ui |
| `class-variance-authority`, `clsx`, `tailwind-merge` | shadcn's variant and `cn` helper |
| `tw-animate-css` | shadcn animations |
| `lucide-react` | Icon set mandated by the shared UI/UX spec |
| `tailwindcss`, `@tailwindcss/postcss`, `postcss` | Styling stack mandated by the shared UI/UX spec |

No competing UI kit is used.

## Prototype data shapes

These describe what the screens collect. They are **proposals to inform later database and API decisions**, not contracts. Fields are free text with no validation in the prototype.

- **Organization:** name, type, number-of-employees range, country, city, website, contact email, phone, logo (not stored). Organization details are held in the prototype store and shown on the review screen.
- **Department:** name, optional code, accent color, order. Flat; nesting is not modeled.
- **Employee:** name, work email, job title, department, "can review others", reviewer (another employee). A person can be a reviewer and also be reviewed, but cannot be chosen as their own reviewer.
- **Configuration:** see below.

### Configuration fields (prototype)

| Section | Fields |
|---|---|
| Dates and locale | Time zone, appraisal-year start month, date format, week start, working days, language |
| Invitations and email | Invitation expiry (days), sender name, reply-to email, reminder frequency |
| Access and security | Sign-in method (password, single sign-on, both), allowed email domains, session timeout, two-step verification |
| Evidence and data | Allowed file types, maximum file size, retention period |

KPI, KRA, scoring and weight settings belong to Framework Studio, and model settings belong to the Prediction and Recommendation modules. They are intentionally not collected here. Secrets such as API keys are never entered in onboarding.

## Open decisions raised by the prototype

- Wording: "Reviewer" is used in the UI; the project documents say "Reviewer" and "Faculty". Confirm the product vocabulary for non-educational organizations.
- Scope of Configuration. The documented onboarding places time zone on the institution profile; the prototype moves it to a Configuration step. Confirm which fields belong in onboarding and which in later Settings.
- Whether prediction and recommendation visibility to faculty and reviewers (policy) and integration status (email, single sign-on, AI assistance on or off) belong in Configuration. Not included yet.
- Whether departments can be nested, and what happens to people when a department is removed (the prototype moves them to "No department").
- Import file format, size limit and duplicate handling; the prototype adds sample rows instead of reading a file.
- Sign-in method, verification method and code lifetime.
- How "setup complete" is defined for other modules.

## Known limitations and deviations

Deviations from the acceptance criteria written in Issue #69:

- The persistent on-screen banner that the screens are not connected to a backend was **removed** in this version. The prototype still must not claim real onboarding; a banner should be restored or the criterion changed.
- The signed-in screens (home, invitations, people) and their sample data go beyond the onboarding scope written in Issue #69. They are design proposals; metric definitions, the invitation lifecycle and the administrator's monitoring responsibilities still need stakeholder agreement (see [UI/UX](UI-UX.md)).
- Several states listed in Issue #69 are **not covered**: verification pending and expired code, import bad and duplicate rows, expired invitation or delivery failure after sending, session expired, access denied, saved for later, and a setup home. The review checks are informational and never block sending; a self-review conflict cannot occur because a person is never offered as their own reviewer.
- Browser `sessionStorage` is used to carry demo data between pages. It is not presented as real persistence, but the issue asked for in-memory only.
- No automated tests are committed for the prototype. Verification so far: TypeScript check, a production build, screenshots of each screen, and a one-off end-to-end run (144 of 144 checks passed on 2026-11-23). The scope and gaps of that run are recorded in [Testing](TESTING.md).
- Not verified: a full dark-mode visual review, a keyboard-only pass of every flow, screen-reader behavior, other browsers, and a formal accessibility review. At a 390 px phone width nothing overflows the screen, but the layouts were not designed or reviewed for mobile use.

Documentation outside this module that is out of date and needs a separate documentation change: `apps/web/README.md` and `docs/project/REPOSITORY-STRUCTURE.md` still describe `apps/web` as an empty starter shell. The shared palette and component guidance in `docs/project/UI-UX.md` is not updated by this module; adopting the tokens above project-wide needs its own documentation PR.
