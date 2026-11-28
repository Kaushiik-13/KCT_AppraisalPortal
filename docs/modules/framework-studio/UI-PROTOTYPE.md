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

1. **Metric strip:** **KPIs** (with how many KRAs and how many are live), **Employees** appraised this cycle, **KPI submissions** (made of expected, where expected = employees × live KPIs), **Submission rate**, **Waiting for review** (with average review time) and **Late submissions** (average days after the deadline, and how many were late). A line above the strip says what a submission is: one employee's answer to one KPI. Numbers with no chart (KPIs, Employees, Late submissions) sit in a plain top row that is not clickable. The numbers that have a chart (KPI submissions, Submission rate, Waiting for review) sit in a second row styled as tabs: clicking one (or using the arrow keys) switches the chart below to that number over time, with the deadline marked. A **Weekly / Monthly** switch above the chart changes the scale: weekly points are dated by the week's start (5 Jan, 12 Jan and so on) and monthly points show the month (Jan to Jun).
2. **Submission panel** with tabs: **By KRA**, **By KPI** and **By department**. Each row has the name, a slim bar and two aligned columns, **Submitted** (count) and **Rate**.
3. **KPI panel** with tabs: **KPIs per KRA** (one grey bar for all KPIs in the KRA, with Draft and Live columns). Panel bars use the brand colour (near-black) on a light grey track; red marks problems only, **Least submitted** and **To fix** (KPIs missing inputs or scoring rules).

On phones the bar moves under the name so names are not cut off.
4. **KPIs by KRA:** a table grouped by KRA. Each KRA row shows its KPI count and totals for its live KPIs (submissions, average rate, average return rate). Click a KRA, or **Expand all**, to open the KPIs inside it; each KPI links to its editor and draft KPIs show dashes. Searching opens every KRA with a match. Columns can be sorted within each KRA.

Marks are not shown on the Overview: they would be invented until scoring policy is approved (#20).

Filter chips for KRA and department sit above (dashed when off, solid with the picked value and a clear button when on, plus Reset), with the running cycle on the right. States:

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

A full-screen **workflow canvas**, top-down and laid out automatically, based on the PoC's workflow builder (`legacy/poc/web/src/TreeBuilder.jsx`, `workflowModel.js`, `reusableTools.js`). Steps cannot be dragged freely; a free, n8n-style canvas may replace the auto layout later.

**Top bar:** back to the library; the code and name, which open **KPI details** (name, code, description, KRA, who it applies to); the status ("Draft", "Live v2" or "Live v2 · editing v3"); a **Workflow | Test** switch; a save indicator; **Versions**; **Discard**; and **Publish**.

**The PoC's three layers:**

| Layer | What it is | In the prototype |
|---|---|---|
| **Blocks** | Steps on the canvas | **Trigger** "Employee submits" (holds the form fields and evidence settings; always first), **Action**, **Condition** (one field: is at least / at most / equals / between / is answered; Met and Not met paths), **Split by role**, **Human review** (hands the submission to the person's reviewer; ends the path), **Result** (ends a path with a named outcome) |
| **Tools** | What an Action runs | **Score** works: rules of the form "if *field* *is at least / at most / equals / between* *value* then *points*"; the first match wins and no match scores 0. **Check date range**, **Extract evidence**, **Compare evidence** and **Find duplicates** are listed as **Later** |
| **Plugins** | A ready-made workflow added in one go | **Publication** is listed as **Later** |

Score is the only step that gives marks, so a Condition and a scoring rule can never give two different verdicts (a problem found in the PoC walkthrough). Each path can have its own Score step.

**Building:**

- A new KPI starts with **Employee submits → Score → Reviewer checks it**, so a simple KPI needs no canvas work.
- **+** on every connection, and on every open path, opens the step library (blocks, tools, plugins, with search). The new step takes over what that connection led to. Blocks that end a path (Human review, Result) can only go on an open path.
- Clicking a step opens its settings in a drawer on the right (a bottom sheet on phones). **Remove step** joins up a step with one way out; for a Condition or Split it also removes the steps only it led to.
- Each step shows **Ready** or what it still needs, for example "Add at least one form field", "Choose a field to check" or "Connect every path".
- Zoom in, zoom out and fit to screen sit at the bottom right.

**Scoring by role:** **Split by role** sends people down different paths. Each role branch matches **people who review others** or **job titles containing** given words (for example "Lead, Manager"); a last path catches everyone else and can be renamed, for example "Team member". The sample KPI **TL-6 Peer reviews completed** shows it: team members get 10 points for 1 peer review, while leads need 2 for 10 points (1 gives 5).

**Test mode:** choose who is submitting (Team member or Lead presets, or any job title and whether they review others), fill the form and **Run test**. The canvas darkens the path taken and fades the rest; the panel shows the points, the outcome and each step's result, for example "Went to Lead" and "Rule 2 matched: 5 points". Clicking a step in the trace opens it. A run stops at the trigger when a required field is empty, and a warning appears when the workflow or form changed after the run.

**Saving and versions:**

- Changes save automatically as you type.
- A draft KPI is edited in place. **Publish** makes it v1.
- Editing a **live** KPI saves the changes as the next version beside it. The live version stays in use, and cycles that already use it keep it, until you publish. **Discard changes** removes the pending version.
- Publishing runs checks: a name, and every step's needs (form fields, labels, a file field when evidence is required, a field for each Condition, named roles, every path connected). Missing scoring rules are a warning only. Each item has a **Fix** link that opens the step. A short "what changed" note is recorded.
- **Versions** lists every published version with its note and date, plus any pending draft.

## How it is built

| Path | Purpose |
|---|---|
| `lib/frameworks/types.ts` | KRA, KPI, input, scoring rule, version and analytics shapes. These become shared contracts when the API exists. |
| `lib/frameworks/sample-data.ts` | Sample KRAs, KPIs and results. Not approved policy. |
| `lib/frameworks/use-framework-library.ts` | One shared store for KRAs and KPIs with actions (add and edit KRAs, create, save, publish, discard, duplicate, archive and restore KPIs). It starts empty and is kept in `sessionStorage` under `afpi-frameworks-v3`. |
| `lib/frameworks/use-framework-analytics.ts` | `useFrameworkAnalytics(scope, filters)` over a pure `buildFrameworkAnalytics` function. Scope is the organization or one reviewer's team. |
| `lib/frameworks/scoring.ts` | Runs a test submission through one Score step's rules. |
| `lib/frameworks/workflow.ts` | The workflow model: blocks, tools and plugins, adding and removing steps, the checks shown on steps, and test runs. |
| `components/frameworks/workflow/` | The canvas (React Flow with a dagre top-down layout), the step library, step settings and the test panel. |
| `components/dashboard/` | `MetricStrip` and `RankedPanel`, shared with Home. |
| `components/frameworks/` | Analytics, KPI table, empty state, library dialogs, editor sections and the prototype view switch. |

Components never check roles. Each page decides who is looking and passes in what they may see or do, so a reviewer page can reuse the analytics later.

To start again from nothing, clear the browser tab's site data or open a new tab.

## Known limitations

- Everything is a prototype: no backend, and changes last only for the browser tab.
- Scoring rules, weights, maximums and caps are not approved policy (#20). Marks and analytics are sample data.
- Administrators only. Reviewer and employee screens are not built.
- The brand colour is now near-black (`--primary` `#111111`, dark `#EDEDED`) with neutral greys across the app. The colour table in `docs/modules/organization/UI-PROTOTYPE.md` still lists the old blue and needs an update by its owner. `--info` (Invited) stays blue.
- Appraisal cycles and assigning KPIs to people are not built. Submission, review and late numbers come from a sample cycle shown once a KPI is live. Cycles keeping "their" version is described, not implemented.
- The appraisal-cycle selector in the top bar does not filter anything.
- File uploads are shown but not tested in Test mode.
- Only the Score tool runs. Check date range, Extract evidence, Compare evidence, Find duplicates and the Publication plugin are listed as Later.
- Split by role matches free-text job titles, which is approximate. A proper list of roles or designations belongs to the Organization module. The Overview still counts expected submissions as employees × live KPIs, not per role.
- The canvas uses an automatic top-down layout; steps cannot be dragged or freely connected, and there is no undo yet.
- Checked by hand and with scripted browser runs at 1366 by 900 (desktop) and 390 wide (phone). Dark mode, keyboard-only use and screen readers were not reviewed in depth.
