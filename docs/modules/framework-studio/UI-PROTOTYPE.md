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

In the style of Vercel analytics and the Stripe dashboard. Everything on it is about the KRAs and KPIs:

1. **Metric strip:** **KPIs** (with how many KRAs and how many are live), **Employees** appraised this cycle, **KPI submissions** (made of expected, where expected = employees × live KPIs), **Submission rate**, **Waiting for review** (with average review time) and **Late submissions** (average days after the deadline, and how many were late). A line above the strip says what a submission is: one employee's answer to one KPI. The submission and review numbers double as tabs: clicking one (or using the arrow keys) switches the chart below to that number over time, with the deadline marked. A **Weekly / Monthly** switch above the chart changes the scale: weekly points are dated by the week's start (5 Jan, 12 Jan and so on) and monthly points show the month (Jan to Jun).
2. **Submission panel** with tabs: **By KRA**, **By KPI** and **By department**. Each row has the name, a slim bar and two aligned columns, **Submitted** (count) and **Rate**.
3. **KPI panel** with tabs: **KPIs per KRA** (a two-tone bar, dark for live and light for draft, with Draft and Live columns), **Least submitted** and **To fix** (KPIs missing inputs or scoring rules).

On phones the bar moves under the name so names are not cut off.
4. **KPI table:** code, KPI, KRA, submitted count, rate, return rate and status, with filter pills (All, Live, Draft), search and sortable columns.

Marks are not shown on the Overview: they would be invented until scoring policy is approved (#20).

Filters for KRA and department sit above. States:

- **Nothing built** (where the prototype starts): "No KRAs or KPIs yet", one line on what to do, and two buttons: **New KRA**, which opens the New KRA dialog, and **Use a template**, which loads sample KRAs and KPIs.
- **No KPI live yet** (after the first KRA, while every KPI is a draft): the strip shows KRAs, KPIs, draft KPIs and KPIs to fix; the KPI panel shows KPIs per KRA and To fix; the table shows dashes.
- **Cycle running:** appraisal cycles are not built, so as soon as one KPI is live the prototype shows a **sample** cycle (2026 H1: opens 5 Jan, deadline in the week of 25 May, now in the week of 8 Jun), labelled "sample submissions until appraisal cycles are built". KPIs you create get generated sample numbers too.

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
- Appraisal cycles and assigning KPIs to people are not built. Submission, review and late numbers come from a sample cycle shown once a KPI is live. Cycles keeping "their" version is described, not implemented.
- The appraisal-cycle selector in the top bar does not filter anything.
- File uploads are shown but not tested in Preview and test.
- Checked by hand and with scripted browser runs at 1366 by 900 (desktop) and 390 wide (phone). Dark mode, keyboard-only use and screen readers were not reviewed in depth.
