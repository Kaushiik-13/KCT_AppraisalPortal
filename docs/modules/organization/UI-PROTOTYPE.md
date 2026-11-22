# Organization — UI prototype and design reference

## Status

**Current implementation:** a clickable, **nonfunctional design prototype** of the Organization onboarding screens in `apps/web` (Issue #69). It has no backend, no authentication, no email, no database and no validation. Data lives in React state and is kept only in the browser tab's `sessionStorage` so the flow can be demonstrated across pages. It is **not** a production onboarding flow and must not be described as one.

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
| 8 | `/setup/review` | Review and send invitations | **Not built yet.** |

The setup screens (3 to 8) share one layout: a title ("Organization onboarding"), a left vertical stepper, and Back and Continue buttons. `/` redirects to `/signup`.

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

`--success`, `--warning` and `--info` (and their foregrounds) are provisional additions; the shared status-color decision is tracked in `docs/project/UI-UX.md`. The dark tokens exist but **dark mode is not verified** and the prototype has no theme toggle.

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

`button`, `input`, `label`, `select`, `switch`, `dialog`, `card`, `dropdown-menu`, `checkbox`, `badge`.

Installed from shadcn but **not currently used**: `alert`, `alert-dialog`, `progress`, `radio-group`, `separator`, `sheet`, `skeleton`, `table`, `tabs`, `textarea`, `tooltip`. They can be pruned before a PR if reviewers prefer.

### Prototype components (`apps/web/components`)

| Component | Purpose |
|---|---|
| `brand.tsx` | AFPI mark and name |
| `color-picker.tsx` | Row of small light swatches (radio group) for a department color |
| `add-employee-dialog.tsx` | Add-employee popup with "add and add another" |
| `import-employees.tsx` | Per-department drag and drop import popup |

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

- **Organization:** name, type, number-of-employees range, country, city, website, contact email, phone, logo (not stored).
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

- Wording: "Reviewer" is used in the UI; the project documents say "Supervisor/reviewer" and "Faculty". Confirm the product vocabulary for non-educational organizations.
- Scope of Configuration. The documented onboarding places time zone on the institution profile; the prototype moves it to a Configuration step. Confirm which fields belong in onboarding and which in later Settings.
- Whether prediction and recommendation visibility to faculty and supervisors (policy) and integration status (email, single sign-on, AI assistance on or off) belong in Configuration. Not included yet.
- Whether departments can be nested, and what happens to people when a department is removed (the prototype moves them to "No department").
- Import file format, size limit and duplicate handling; the prototype adds sample rows instead of reading a file.
- Sign-in method, verification method and code lifetime.
- How "setup complete" is defined for other modules.

## Known limitations and deviations

Deviations from the acceptance criteria written in Issue #69:

- The persistent on-screen banner that the screens are not connected to a backend was **removed** in this version. The prototype still must not claim real onboarding; a banner should be restored or the criterion changed.
- Several states listed in Issue #69 are **not covered**: verification pending and expired code, import bad and duplicate rows, expired invitation, session expired, access denied, saved for later, self-review conflict, and a setup home.
- The Review and send invitations screen is **not built**.
- Browser `sessionStorage` is used to carry demo data between pages. It is not presented as real persistence, but the issue asked for in-memory only.
- No automated tests exist for the prototype. Verification so far: TypeScript check, a production build, and screenshots of each screen in light mode.
- Not verified: dark mode, keyboard-only flow, screen-reader behavior, responsive layouts below desktop width, and a formal accessibility review.

Documentation outside this module that is out of date and needs a separate documentation change: `apps/web/README.md` and `docs/project/REPOSITORY-STRUCTURE.md` still describe `apps/web` as an empty starter shell. The shared palette and component guidance in `docs/project/UI-UX.md` is not updated by this module; adopting the tokens above project-wide needs its own documentation PR.
