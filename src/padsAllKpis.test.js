import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runWorkflow } from "./workflowEngine.js";

// Institutional KRA rows 173-177 (BOS coordinator / placement coordinator, NAAC criteria I
// coordinator, MS Teams coordinator, Spoken Tutorial coordinator, class advisor) are
// intentionally not modelled here. PADS scores these duties on a 5-point supervisor scale
// and provides no Max Points, evidence fields, role eligibility, caps, or aggregation
// rules. AFPI would need a 1-5 institutional score field, duty/role eligibility, evidence
// or notes, supervisor or panel review, one claim per duty per period, audit history, and
// aggregation into the institutional KRA.

const base = new URL("../public/samples/pads/kpis/", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, base), "utf8"));

const groups = read("cases.json");
const index = read("index.json");

test("PADS individual-KPI fixture set covers 59 rows and 201 cases", () => {
  assert.equal(groups.length, 59);
  assert.equal(
    groups.reduce((total, group) => total + group.cases.length, 0),
    201,
  );
  assert.equal(new Set(groups.map((group) => group.id)).size, 59);
  assert.equal(index.kpis.length, 59);

  groups.forEach((group, position) => {
    const entry = index.kpis[position];
    const message = `${group.id} index entry`;
    assert.equal(entry.id, group.id, message);
    assert.equal(entry.title, group.title, message);
    assert.equal(entry.caseCount, group.cases.length, message);
    assert.deepEqual(
      entry.expectedPoints,
      [...new Set(group.cases.map((item) => item.expect))].sort((a, b) => a - b),
      message,
    );
    assert.deepEqual(
      entry.fields,
      group.fields.map((field) => field.id),
      message,
    );

    const record = read(`${group.id}.json`);
    assert.equal(record.draft.policy.enabled, true, `${group.id} policy enabled`);
  });

  assert.deepEqual(index.excluded.workbookRows, [173, 174, 175, 176, 177]);
});

for (const group of groups) {
  test(`${group.id}: ${group.title}`, async () => {
    const draft = read(`${group.id}.json`).draft;

    assert.deepEqual(
      draft.fields.map((field) => ({ id: field.id, type: field.type })),
      group.fields.map((field) => ({ id: field.id, type: field.type })),
      `${group.id} field definitions`,
    );

    for (const item of group.cases) {
      const label = `${group.id} ${JSON.stringify(item.values)}`;
      const run = await runWorkflow({
        nodes: draft.nodes,
        fields: draft.fields,
        values: item.values,
        policy: draft.policy,
        extract: async () => null,
      });
      assert.equal(run.status, "completed", label);
      assert.equal(run.scoring?.status, "scored", label);
      assert.equal(run.scoring?.points, item.expect, label);
    }
  });
}
