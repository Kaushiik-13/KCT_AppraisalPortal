import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  datasetSummary,
  generateSyntheticDatasets,
  rowsToCsv,
  sha256,
  SYNTHETIC_COLUMNS,
} from "../src/prediction/syntheticGenerator.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(repositoryRoot, "fixtures", "prediction", "kct");
const configRoot = path.join(fixtureRoot, "config");
const outputRoot = path.join(fixtureRoot, "generated");

async function readJson(name) {
  return JSON.parse(await fs.readFile(path.join(configRoot, name), "utf8"));
}

const organization = await readJson("organization.json");
const policy = await readJson("pads-policy-v1.json");
const defaults = await readJson("generation-defaults.json");
const datasets = generateSyntheticDatasets({ organization, policy, defaults });
const outputs = {
  "no-history-current.csv": rowsToCsv(datasets.current),
  "limited-history.csv": rowsToCsv(datasets.limited),
  "sufficient-history.csv": rowsToCsv(datasets.sufficient),
  "invalid-history.csv": rowsToCsv(datasets.invalid),
};

await fs.mkdir(outputRoot, { recursive: true });
for (const [name, content] of Object.entries(outputs))
  await fs.writeFile(path.join(outputRoot, name), content, "utf8");

const activeSnapshots = {
  synthetic: true,
  organizationId: organization.id,
  policyVersion: policy.version,
  generatorVersion: defaults.generatorVersion,
  seed: defaults.seed,
  rows: datasets.current,
};
const activeJson = `${JSON.stringify(activeSnapshots, null, 2)}\n`;
await fs.writeFile(path.join(outputRoot, "active-employee-snapshots.json"), activeJson, "utf8");

const report = {
  synthetic: true,
  generatedAt: defaults.generatedAt,
  generatorVersion: defaults.generatorVersion,
  seed: defaults.seed,
  organization: { id: organization.id, name: organization.name },
  policy: {
    version: policy.version,
    status: policy.status,
    overallScoreCap: policy.overallScoreCap,
    kraCount: policy.kras.length,
    roleCount: policy.roles.length,
  },
  columns: SYNTHETIC_COLUMNS,
  datasets: {
    current: datasetSummary(datasets.current, policy),
    limited: datasetSummary(datasets.limited, policy),
    sufficient: datasetSummary(datasets.sufficient, policy),
    invalid: datasetSummary(datasets.invalid, policy),
  },
  checksums: Object.fromEntries([
    ...Object.entries(outputs).map(([name, content]) => [name, sha256(content)]),
    ["active-employee-snapshots.json", sha256(activeJson)],
  ]),
  limitations: [
    "All records are synthetic and cannot establish real KCT prediction accuracy.",
    "The first fixture models KRA-level progress and PADS role/KRA caps.",
    "Detailed KPI scoring bands remain configuration work pending confirmation of the current KCT policy.",
    "Mandatory criteria are represented as a status feature; no unsupported automatic score penalty is applied."
  ]
};
await fs.writeFile(path.join(outputRoot, "generation-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  outputRoot,
  files: [...Object.keys(outputs), "active-employee-snapshots.json", "generation-report.json"],
  summaries: report.datasets,
}, null, 2));
