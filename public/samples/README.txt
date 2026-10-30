Sample PDF: The PRISMA 2020 statement: An updated guideline for reporting systematic reviews
Authors: Matthew J. Page et al.
Journal: PLOS Medicine
Published: 2021-03-29
DOI: 10.1371/journal.pmed.1003583
Publication URL: https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1003583
PDF source: https://journals.plos.org/plosmedicine/article/file?id=10.1371/journal.pmed.1003583&type=printable
Copyright: 2021 Page et al. Creative Commons Attribution License, as stated in the publisher's article and PDF. This is an unmodified copy with original author attribution retained.

Use Matthew J. Page as the SAMPLE faculty name for first-author matching.
Use an assessment period including 2021-03-29 for the eligible-date case, or a period excluding that date for the ineligible case.
This is a methodological guideline paper used to test document handling; its acceptability under a real institutional KPI must be determined separately.
No Scopus/WOS indexing status has been verified. Do not treat this fixture as indexing evidence.

Sample workbook: PADS Academic Review - 2021 (Kumaraguru College of Technology)
File: PADS.xlsx
Sheets: PADS Overview, PADS Template, Guidelines
Source: supplied by the project owner on 2026-10-29; unmodified copy, SHA-256 a44c39681c0da5e2a544305dbe477901e60d5cc56b62b199aa1592f6912b0c15
Contents: blank appraisal template - appraisee name, employee ID, department, designation and appraiser fields are empty; no personal submissions.
Approval status: reference/teaching template only. Whether the institution has approved these rules for live use is NOT verified; confirm the approved version and source with the owner before treating scores as authoritative.
Use this fixture to test Framework Studio input mapping, KRA/KPI policy, score bands and eligibility rules against the template's own sheet and column names.

PADS TL-1 verification fixtures:
- public/samples/pads/tl1-initial-kpi.json: saved-draft record for TL-1; reference-only, not an approved policy.
- public/samples/pads/evidence-tl1-clear.pdf: synthetic one-page PDF with the line "Teaching score: 90"; no personal data.
- public/samples/pads/evidence-tl1-unreadable.pdf: synthetic one-page PDF with no extractable text.
- public/samples/pads/evidence-tl1-invalid.txt: synthetic unsupported-format file for the invalid-evidence path.
These files support docs/PADS-TL1-WALKTHROUGH.md. They do not represent an institutional submission or approved PADS rule interpretation.

PADS 59-KPI reference fixtures:
- public/samples/pads/kpis/<id>.json: 59 saved-draft policies, one per individual PADS row (tl-1..tl-14, rd-1..rd-16, ei-1..ei-11, o-1..o-10, sd-1..sd-6, ec-1..ec-2).
- public/samples/pads/kpis/cases.json: the 59 groups and their 201 expected scoring cases.
- public/samples/pads/kpis/index.json: source map from KPI id to PADS Template workbook row, Sl No, fields, case count and expected points, plus the excluded institutional rows and the reason.
- public/samples/pads/kpis/README.md: what the set is, how to load one fixture into localStorage, and the institutional-row note.
Reference-only and not approved policy. These are configuration plus synthetic input/expected values, with no personal, appraisal, or submission data. Their cases are executed by src/padsAllKpis.test.js; see docs/PADS-INDIVIDUAL-KPIS.md.
