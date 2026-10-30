import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runWorkflow, validateSubmission } from "./workflowEngine.js";

const fixture = JSON.parse(
  readFileSync(
    new URL("../public/samples/pads/tl1-initial-kpi.json", import.meta.url),
    "utf8",
  ),
).draft;

const values = {
  pct: "90",
  evidence: [{ name: "evidence-tl1-clear.pdf", type: "application/pdf" }],
};
const extraction = {
  format: "pdf",
  fileName: "evidence-tl1-clear.pdf",
  sections: [
    {
      title: "Synthetic evidence",
      text: "Teaching score: 90\nSynthetic test evidence",
      location: { page: 1 },
    },
  ],
  warnings: [],
};
const run = (patch = {}) =>
  runWorkflow({
    nodes: fixture.nodes,
    fields: fixture.fields,
    values: { ...values, ...patch.values },
    policy: fixture.policy,
    extract: patch.extract || (async () => structuredClone(extraction)),
  });

test("initial PADS KPI rejects missing and invalid inputs", () => {
  const field = fixture.fields[0];
  assert.match(validateSubmission([field], { pct: "" })[0], /required/);
  assert.match(validateSubmission([field], { pct: "ninety" })[0], /valid number/);
  assert.match(
    validateSubmission([fixture.fields[1]], {
      evidence: [{ name: "evidence-tl1-invalid.txt", type: "text/plain" }],
    })[0],
    /allowed file format/,
  );
});

test("initial PADS KPI scores clear evidence and hands the package to review", async () => {
  const result = await run();
  assert.equal(result.status, "sent-to-review");
  assert.equal(result.review.package.scoring.length, 1);
  assert.equal(result.review.package.scoring[0].points, 8);
  assert.equal(result.review.package.extraction[0].status, "candidate");
  assert.equal(result.review.package.extraction[0].fields.reported_score, 90);
  assert.equal(result.review.role, "Appraiser");
  assert.match(result.review.instructions, /provisional PADS points/);
});

test("initial PADS KPI applies the documented score bands", async () => {
  for (const [pct, points] of [
    [85, 8],
    [84, 6],
    [75, 6],
    [74, 4],
    [65, 4],
    [64, 0],
  ]) {
    const result = await run({ values: { pct: String(pct) } });
    assert.equal(result.status, "sent-to-review");
    assert.equal(result.review.package.scoring[0].points, points, `pct=${pct}`);
  }
});

test("unreadable evidence stays explicit instead of silently becoming verified", async () => {
  const result = await run({
    extract: async () => ({
      format: "pdf",
      fileName: "evidence-tl1-unreadable.pdf",
      sections: [],
      warnings: [],
    }),
  });
  assert.equal(result.status, "sent-to-review");
  assert.equal(result.review.package.extraction[0].status, "candidate_with_warnings");
  assert.match(result.review.package.extraction[0].warnings.join(" "), /not found/);
  assert.equal(result.review.package.scoring[0].points, 8);
});

test("missing required evidence stops before extraction", async () => {
  let calls = 0;
  const result = await run({
    values: { evidence: [] },
    extract: async () => {
      calls++;
      return extraction;
    },
  });
  assert.equal(result.status, "error");
  assert.equal(calls, 0);
  assert.match(result.issues[0], /required/);
});
