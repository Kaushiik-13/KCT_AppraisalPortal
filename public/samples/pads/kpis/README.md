PADS individual KPI fixtures (59 rows)
=====================================

59 saved-draft KPI policies copied from the 29 October 2026 UI verification pass, one file
per individual PADS row: tl-1..tl-14, rd-1..rd-16, ei-1..ei-11, o-1..o-10, sd-1..sd-6,
ec-1..ec-2. Every fixture is a complete saved-draft record ({version, savedAt, draft}) that
can be loaded straight into localStorage with the key afpi.kpi-draft.v1.

Reference only. These encodings are a working interpretation of the "PADS Template" sheet in
PADS.xlsx (SHA-256 a44c39681c0da5e2a544305dbe477901e60d5cc56b62b199aa1592f6912b0c15). They are
NOT an institutional approval, NOT the institution's official rules, and do not carry PADS
KRA weights, role maxima or the 200-point cap. Confirm the approved policy with the project
owner before treating any score as authoritative. No personal data, submissions, or
appraisee details are present in these files.

Files
-----
<id>.json          one saved-draft policy per individual KPI row
cases.json         the 59 groups and their 201 expected scoring cases (values + expected points)
index.json         source map: KPI id -> workbook row / Sl No / fields / case count / expected
                   points, plus the excluded institutional rows and the reason they are excluded
README.md          this file

The cases run through the workflow engine in src/padsAllKpis.test.js (npm test): each case is
fed to runWorkflow with extract set to null, and the resulting points must equal the expected
value. 60 tests cover the 59 rows and the fixture metadata.

Loading a fixture by hand
-------------------------
Serve the app, then run this in the browser console on any app page:

  const record = await fetch('/samples/pads/kpis/rd-12.json').then((r) => r.json());
  localStorage.setItem('afpi.kpi-draft.v1', JSON.stringify(record));
  location.reload();

Open Framework Studio to inspect the policy, or Workflow -> Test & review to score a case.
docs/PADS-INDIVIDUAL-KPIS.md lists every row with its workbook row, fields, case count and
expected points.

Institutional rows (excluded)
-----------------------------
PADS workbook rows 173-177 (BOS coordinator/Placement Coordinator, NAAC criteria I
Coordinator, MS Team Coordinator, Spoken Tutorial Coordinator, Class Advisor) under
"INSTITUTIONAL OR DEPARTMENTAL CONTRIBUTIONS AND OUTCOMES" are intentionally not implemented.
PADS scores these duties on a 5-point supervisor scale and provides no Max Points, evidence
fields, role eligibility, caps, or aggregation rules. AFPI would need a 1-5 institutional
score field, duty/role eligibility, evidence or notes, supervisor or panel review, one claim
per duty per period, audit history, and aggregation into the institutional KRA.
