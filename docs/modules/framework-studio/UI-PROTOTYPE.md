# Framework Studio — UI prototype

**Current implementation:** a clickable, **nonfunctional** UI prototype in `apps/web` (Issue #79). It has no backend, API, database or validation on a server. KRAs, KPIs, versions, submission numbers, review numbers and marks are **sample data** kept in the browser tab (`sessionStorage`). Scoring rules are **unapproved drafts**: they are for testing only until scoring policy is agreed in #20.

**Proposed design:** the screens and behaviour below are design proposals for review, not agreed requirements.

**Known limitations:** see the end of this page.

## Where it lives

The administrator sidebar has a **Studio** group, separate from the day-to-day pages:

- Home, People, Invitations
- Studio: **Frameworks**, Prediction (Later), Recommendation (Later)
- Organization settings and Your profile are in the user menu at the bottom of the sidebar.

On phones the top tabs are Home, People and Frameworks, and everything else is under **More**.

## Routes

| Route | Screen | Who |
|---|---|---|
| `/frameworks` | Overview: analytics | Administrators |
| `/frameworks/library` | KRAs and KPIs library | Administrators |
| `/frameworks/kpis/[id]` | KPI editor in focus mode (no sidebar) | Administrators. Archived KPIs open read-only. |

The prototype is **administrators only** for now. Reviewer views are not built; the analytics components take a scope so they can be reused for them later.

## Screens

### Overview (`/frameworks`)

In the style of Vercel analytics and the Stripe dashboard:

1. **Metric strip:** submission rate, waiting for review, overdue and released marks. The numbers double as tabs: clicking one (or using the arrow keys) switches the single chart below to that number week by week, with the deadline marked.
2. **Two ranked panels** with tabs in the header and a light bar behind each row. Left: submissions by KPIs, KRAs or departments. Right: return rate, marks by KRA (sample) or KPIs to fix.
3. **KPI table:** filter pills (All, Live, Draft), search and sortable columns.

Filters for KRA and department sit above. States:

- **Nothing built** (where the prototype starts): a guide (create KRAs, add KPIs, test and publish) with **Start from template**, which loads sample KRAs and KPIs, and **Create from scratch**, which opens the New KRA dialog.
- **Framework built** (after the template or the first KRA): the strip shows the framework's own numbers (KRAs, live KPIs, drafts, to fix), the To fix panel lists unfinished KPIs and the table shows dashes, because no cycle has run.
- **Cycle running:** the submission, review and mark analytics described above. No cycles exist yet, so this state is designed and built but not reachable in the prototype.

### KRAs and KPIs library (`/frameworks/library`)

- **KRA list** on the left (a dropdown on phones): All KPIs, each KRA with its colour and count, and Archived. **+** opens the KRA dialog (name, code used as the KPI code prefix, colour, description). Two KRAs cannot share a code.
- **KRA header:** name, code, description and a **⋯** menu to edit or archive. A KRA cannot be archived while it has live KPIs. KRA weights show as not set until scoring policy is approved.
- **KPI table:** code, name, a short inputs summary, version, status, last updated. Amber notes flag KPIs with no inputs or no scoring rules. A published KPI with pending changes shows "v2 · v3 draft".
- **Row menu:** Edit, Duplicate (creates a draft copy with the next free code), View versions, Archive. Archived KPIs can be **restored as drafts**, so they are checked again before going live. Nothing is hard-deleted.
- **New KPI** creates a draft in the selected KRA and opens the editor.

### KPI editor (`/frameworks/kpis/[id]`)

A full-width focus mode with its own top bar: back to the library, code and name, status ("Draft", "Live v2" or "Live v2 · editing v3"), a save indicator, **Versions**, **Discard changes** and **Publish**. Steps:

1. **Basics:** name, code, description, KRA, who it applies to.
2. **Inputs:** fields the employee fills in (number, choice, yes/no, text, date, file upload), each with a label, required switch, help text, min and max for numbers and options for choices. Fields can be reordered and removed.
3. **Evidence:** whether proof is required, allowed file types and guidance. Warns when evidence is required but there is no file input.
4. **Scoring:** rules of the form "if *input* *is at least / at most / equals / between* *value* then *points*". The first matching rule wins and no match scores 0. New rules start at 0 points so nothing is awarded by accident.
5. **Review:** how the assigned reviewer returns or releases a mark. Information only.
6. **Preview and test:** the form as an employee sees it. **Run test** shows the points and which rule matched, blocks when a required field is empty, reports numbers outside their range, and warns when the inputs or rules changed since the last run.

**Saving and versions:**

- Changes save automatically as you type.
- A draft KPI is edited in place. **Publish** makes it v1.
- Editing a **live** KPI saves the changes as the next version beside it. The live version stays in use, and cycles that already use it keep it, until you publish. **Discard changes** removes the pending version.
- Publishing runs checks: a name, at least one input, every input labelled, a file input when evidence is required (all required), and scoring rules (a warning only). A short "what changed" note is recorded.
- **Versions** lists every published version with its note and date, plus any pending draft.

## How it is built

| Path | Purpose |
|---|---|
| `lib/frameworks/types.ts` | KRA, KPI, input, scoring rule, version and analytics shapes. These become shared contracts when the API exists. |
| `lib/frameworks/sample-data.ts` | Sample KRAs, KPIs and results. Not approved policy. |
| `lib/frameworks/use-framework-library.ts` | One shared store for KRAs and KPIs with actions (add and edit KRAs, create, save, publish, discard, duplicate, archive and restore KPIs). It starts empty and is kept in `sessionStorage` under `afpi-frameworks-v2`. |
| `lib/frameworks/use-framework-analytics.ts` | `useFrameworkAnalytics(scope, filters)` over a pure `buildFrameworkAnalytics` function. Scope is the organization or one reviewer's team. |
| `lib/frameworks/scoring.ts` | Runs a test submission through the rules. |
| `components/dashboard/` | `MetricStrip` and `RankedPanel`, shared with Home. |
| `components/frameworks/` | Analytics, KPI table, empty state, library dialogs, editor sections and the prototype view switch. |

Components never check roles. Each page decides who is looking and passes in what they may see or do, so a reviewer page can reuse the analytics later.

To start again from nothing, clear the browser tab's site data or open a new tab.

## Known limitations

- Everything is a prototype: no backend, and changes last only for the browser tab.
- Scoring rules, weights, maximums and caps are not approved policy (#20). Marks and analytics are sample data.
- Administrators only. Reviewer and employee screens are not built.
- Appraisal cycles and assigning KPIs to people are not built, so the cycle-running analytics cannot be reached yet. Cycles keeping "their" version is described, not implemented.
- The appraisal-cycle selector in the top bar does not filter anything.
- File uploads are shown but not tested in Preview and test.
- Checked by hand and with scripted browser runs at 1366 by 900 (desktop) and 390 wide (phone). Dark mode, keyboard-only use and screen readers were not reviewed in depth.
