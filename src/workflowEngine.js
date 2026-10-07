import { executeReusable, reusableIssues } from "./reusableTools.js";
import {
  DEFAULT_AI_INSTRUCTIONS,
  MAX_AI_INSTRUCTIONS,
  MAX_AI_REFERENCE,
  prepareAIInput,
} from "./aiContext.js";
import {
  validateScoringVersion,
  evaluateScoringVersion,
} from "./scoringPolicy.js";
import {
  definition,
  nodeDefinition,
  actionTools,
  publicationTools,
  sourceChoices,
  FACTS,
} from "./workflowModel.js";

export const normalize = (v) =>
  String(v ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export function normalizeDoi(value) {
  let text = String(value || "").trim();
  try {
    text = decodeURIComponent(text);
  } catch {
    /* Retain invalid encoding for validation. */
  }
  const match = text.match(/10\.\d{4,9}\/[-._;()/:a-z0-9]+/i);
  return match ? match[0].replace(/[.,;:]+$/, "").toLowerCase() : "";
}
export function validDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value || "") &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
const dateParts = (parts) =>
  parts?.length === 3
    ? parts.map((n, i) => String(n).padStart(i ? 2 : 4, "0")).join("-")
    : null;
export function crossrefRecord(m, source) {
  return {
    status: "found",
    doi: normalizeDoi(m.DOI),
    title: m.title?.[0] || null,
    journal: m["container-title"]?.[0] || null,
    authors: (m.author || []).map((a) => ({
      name: [a.given, a.family].filter(Boolean).join(" ") || a.name || "",
      orcid: a.ORCID || null,
    })),
    dates: Object.fromEntries(
      ["published", "published-online", "published-print", "issued"].map(
        (k) => [k, dateParts(m[k]?.["date-parts"]?.[0])],
      ),
    ),
    publisher: m.publisher || null,
    source,
    retrievedAt: new Date().toISOString(),
  };
}
export async function lookupPublication(doi, fetcher = fetch) {
  const source = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const res = await fetcher(source, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok)
      return {
        status: "unknown",
        doi,
        source,
        reason:
          res.status === 404
            ? "DOI not found in Crossref. It may belong to another registry."
            : `Publication service returned ${res.status}. Retry later.`,
      };
    const json = await res.json();
    if (!json.message?.DOI || normalizeDoi(json.message.DOI) !== doi)
      return {
        status: "unknown",
        doi,
        source,
        reason: "The service returned an unexpected publication record.",
      };
    return crossrefRecord(json.message, source);
  } catch (e) {
    return {
      status: "unknown",
      doi,
      source,
      reason:
        e.name === "AbortError"
          ? "Publication lookup timed out."
          : "Publication lookup could not connect. Check your connection and retry.",
    };
  } finally {
    clearTimeout(timer);
  }
}
export function validateSubmission(fields, values) {
  const errors = [];
  if (!fields.length) return ["Add input fields first."];
  for (const f of fields) {
    const v = values[f.id];
    const empty =
      v === undefined ||
      v === null ||
      (typeof v === "string" && !v.trim()) ||
      (Array.isArray(v) && !v.length);
    if (!f.label.trim()) errors.push("Every field needs a name.");
    if (f.required && empty) errors.push(`${f.label} is required.`);
    if (empty) continue;
    if (
      ["number", "integer"].includes(f.type) &&
      (!Number.isFinite(Number(v)) ||
        (f.type === "integer" && !Number.isInteger(Number(v))))
    )
      errors.push(
        `${f.label}: enter a valid ${f.type === "integer" ? "whole number" : "number"}.`,
      );
    if (f.type === "url") {
      try {
        if (!["http:", "https:"].includes(new URL(v).protocol)) throw Error();
      } catch {
        errors.push(`${f.label}: enter an http or https URL.`);
      }
    }
    if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      errors.push(`${f.label}: enter a valid email.`);
    if (f.type === "boolean" && !["Yes", "No", true, false].includes(v))
      errors.push(`${f.label}: select Yes or No.`);
    if (f.type === "date" && !validDate(v))
      errors.push(`${f.label}: enter a valid date.`);
    if (f.type === "datetime" && !Number.isFinite(Date.parse(v)))
      errors.push(`${f.label}: enter a valid date and time.`);
    if (["select", "multi"].includes(f.type)) {
      const options = (f.options || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (
        (f.type === "multi" ? (Array.isArray(v) ? v : [v]) : [v]).some(
          (s) => !options.includes(s),
        )
      )
        errors.push(`${f.label}: choose an available option.`);
    }
    if (f.type === "file") {
      const files = Array.isArray(v) ? v : [];
      const allowed = (f.accept || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (
        !files.length ||
        (!f.multiple && files.length > 1) ||
        files.some(
          (file) =>
            !file?.name ||
            (allowed.length &&
              !allowed.some((a) =>
                a.startsWith(".")
                  ? file.name.toLowerCase().endsWith(a)
                  : a.endsWith("/*")
                    ? file.type?.startsWith(a.slice(0, -1))
                    : file.type === a,
              )),
        )
      )
        errors.push(`${f.label}: select the allowed file format and count.`);
    }
  }
  return errors;
}
export function validateWorkflow(nodes, fields) {
  const errors = [];
  if (!nodes.length)
    return ["Add nodes from the catalogue or load the example."];
  if (nodes.filter((n) => n.kind === "submit").length !== 1)
    errors.push("Use exactly one submission trigger.");
  for (const original of nodes) {
    const d = nodeDefinition(original);
    const n = ["action", "plugin"].includes(original.kind)
      ? {
          ...original,
          kind: original.config.tool,
          config: original.config.settings,
        }
      : original;
    if (
      original.kind === "plugin" &&
      !publicationTools.some((t) => t.kind === n.kind)
    ) {
      errors.push(`${n.name}: choose a publication plugin tool.`);
      continue;
    }
    if (
      original.kind === "action" &&
      !actionTools.some((t) => t.kind === n.kind)
    ) {
      errors.push(`${n.name}: choose a tool.`);
      continue;
    }
    if (!d) {
      errors.push("Unknown node type.");
      continue;
    }
    errors.push(...reusableIssues(n).map((e) => `${n.name}: ${e}`));
    if (!n.name.trim()) errors.push("Every node needs a name.");
    for (const p of d.inputs) {
      const s = n.mappings[p.key];
      if (!s && !p.optional) errors.push(`${n.name}: choose ${p.label}.`);
      if (s && !sourceChoices(n, p, nodes, fields).some((c) => c.value === s))
        errors.push(
          `${n.name}: ${p.label} uses a removed, later, or incompatible source.`,
        );
    }
    if (n.kind === "lookup" && !n.mappings.doi && !n.mappings.url)
      errors.push(`${n.name}: choose a DOI or URL source.`);
    for (const r of d.routes) {
      if (!nodes.some((x) => x.id === n.routes[r]))
        errors.push(`${n.name}: connect the ${r} route.`);
    }
    if (n.kind === "condition") {
      if (
        ![
          "eq",
          "ne",
          ...(["number", "date"].includes(n.config.valueType)
            ? ["gte", "lte"]
            : []),
        ].includes(n.config.operator) ||
        typedValue(n.config.expected, n.config.valueType) === null
      )
        errors.push(`${n.name}: choose a valid comparison and expected value.`);
    }
    if (n.kind === "human_review" && !n.config.role?.trim())
      errors.push(`${n.name}: enter a reviewer role.`);
    if (
      n.kind === "use_form_value" &&
      !fields.some((field) => field.id === n.config.fieldId)
    )
      errors.push(`${n.name}: choose an existing form field.`);
    if (n.kind === "result" && !n.config.outcome?.trim())
      errors.push(`${n.name}: name the final outcome.`);
    if (
      n.kind === "ai" &&
      (!(n.config.instructions ?? DEFAULT_AI_INSTRUCTIONS).trim() ||
        (n.config.instructions ?? DEFAULT_AI_INSTRUCTIONS).length >
          MAX_AI_INSTRUCTIONS)
    )
      errors.push(
        `${n.name}: enter system instructions (up to ${MAX_AI_INSTRUCTIONS} characters).`,
      );
    if (
      n.kind === "ai" &&
      ((n.config.referenceText || "").length > MAX_AI_REFERENCE ||
        (n.config.contextInputs || []).some((f) => !f.name.trim()))
    )
      errors.push(
        `${n.name}: name every additional input and keep reference material within ${MAX_AI_REFERENCE} characters.`,
      );
    if (n.kind === "ai" && n.config.outputSchema?.trim()) {
      try {
        const schema = JSON.parse(n.config.outputSchema);
        if (schema.type !== "object" || !schema.properties)
          throw Error("Schema root must be an object with properties.");
        if (
          n.config.outputSchema.length > 3000 ||
          (n.config.instructions ?? DEFAULT_AI_INSTRUCTIONS).length +
            n.config.outputSchema.length +
            80 >
            MAX_AI_INSTRUCTIONS
        )
          throw Error("Instructions and schema exceed the AI instruction limit.");
      } catch {
        errors.push(
          `${n.name}: enter a valid object JSON schema and keep instructions plus schema within ${MAX_AI_INSTRUCTIONS} characters.`,
        );
      }
    }
    if (
      n.kind === "period" &&
      (!validDate(n.config.start) ||
        !validDate(n.config.end) ||
        n.config.start > n.config.end)
    )
      errors.push(`${n.name}: enter a valid assessment start and end date.`);
    if (n.kind === "score")
      errors.push(
        ...validatePolicy(n.config.policy).map((e) => `${n.name}: ${e}`),
      );
    if (n.kind === "index") {
      for (const r of n.config.registry || []) {
        if (
          !normalizeDoi(r.doi) ||
          !validDate(r.start) ||
          !validDate(r.end) ||
          r.start > r.end ||
          !r.source?.trim() ||
          ["scopus", "wos", "sae"].some(
            (k) => !["yes", "no", "unknown"].includes(r[k]),
          )
        )
          errors.push(
            `${n.name}: each mock record needs a DOI, valid coverage dates, statuses, and a source note.`,
          );
      }
      const dois = (n.config.registry || []).map((r) => normalizeDoi(r.doi));
      if (new Set(dois).size !== dois.length)
        errors.push(`${n.name}: use one mock record per DOI.`);
    }
    if (
      n.kind === "duplicate" &&
      (n.config.records || []).some(
        (r) => !normalizeDoi(r.doi) || !r.faculty?.trim(),
      )
    )
      errors.push(`${n.name}: seed records need a DOI and faculty name.`);
  }
  const start = nodes.find((n) => n.kind === "submit");
  const visited = new Set();
  const walk = (id, path) => {
    if (path.includes(id)) {
      errors.push(
        "A route contains a loop. Clarification uses a fresh test run; connect forward only.",
      );
      return;
    }
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    visited.add(id);
    for (const s of Object.values(n.mappings)) {
      if (!s?.startsWith("node|")) continue;
      const [, source, key] = s.split("|");
      const p = nodeDefinition(n).inputs.find((p) => n.mappings[p.key] === s);
      if (!path.includes(source) && !p?.optional)
        errors.push(
          `${n.name}: its ${key} source does not run on every route reaching this step.`,
        );
    }
    for (const target of Object.values(n.routes)) walk(target, [...path, id]);
  };
  if (start) walk(start.id, []);
  for (const n of nodes)
    if (!visited.has(n.id))
      errors.push(`${n.name} is not connected to the submission trigger.`);
  return [...new Set(errors)];
}
export function validatePolicy(p) {
  const errors = [];
  if (!p?.version?.trim()) errors.push("Name the policy version.");
  if (!p?.rules?.length) errors.push("Add a scoring rule.");
  for (const r of p?.rules || []) {
    if (!r.name?.trim() || !r.conditions?.length)
      errors.push("Every rule needs a name and at least one condition.");
    if (!["all", "any"].includes(r.match))
      errors.push("Choose all or any conditions.");
    if (
      r.points === "" ||
      r.multiplier === "" ||
      !Number.isFinite(Number(r.points)) ||
      Number(r.points) < 0 ||
      !Number.isFinite(Number(r.multiplier)) ||
      Number(r.multiplier) < 0
    )
      errors.push("Points and multipliers must be non-negative numbers.");
    for (const c of r.conditions || [])
      if (!FACTS[c.fact]?.includes(c.value) || !["eq", "ne"].includes(c.op))
        errors.push("Choose valid policy conditions.");
  }
  return errors;
}
const candidate = (paper, name) =>
  paper?.findings?.find((f) => f.name === name)?.value;
export function printedDate(raw) {
  const text = String(raw).trim();
  if (validDate(text)) return text;
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const match = text.match(/^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  const reverse = text.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i);
  if (!match && !reverse) return null;
  const month =
    months.indexOf((match ? match[1] : reverse[2]).toLowerCase()) + 1;
  const value = `${(match || reverse)[3]}-${String(month).padStart(2, "0")}-${String(match ? match[2] : reverse[1]).padStart(2, "0")}`;
  return validDate(value) ? value : null;
}
export function compareEvidence(paper, metadata) {
  const findings = [];
  const row = (field, pdf, external, equal) =>
    findings.push({
      field,
      pdf: pdf ?? null,
      external: external ?? null,
      status: !pdf || !external ? "unknown" : equal ? "match" : "conflict",
    });
  const dois = candidate(paper, "DOI");
  row(
    "DOI",
    dois,
    metadata.doi,
    dois?.length === 1 && normalizeDoi(dois[0]) === metadata.doi,
  );
  row(
    "Title",
    candidate(paper, "Title"),
    metadata.title,
    normalize(candidate(paper, "Title")) === normalize(metadata.title),
  );
  row(
    "Journal",
    candidate(paper, "Journal / publication"),
    metadata.journal,
    normalize(candidate(paper, "Journal / publication")) ===
      normalize(metadata.journal),
  );
  const author = candidate(paper, "Authors in order");
  const first = metadata.authors?.[0]?.name;
  const firstPage = normalize(paper.pages?.[0]?.text);
  row(
    "First author",
    author,
    first,
    !!first &&
      normalize(author).startsWith(normalize(first)) &&
      firstPage.includes(normalize(first)),
  );
  const dates = (candidate(paper, "Publication dates") || [])
    .filter((s) => /^(Published|Publication date|Online publication)/i.test(s))
    .map((s) => printedDate(s.slice(s.indexOf(":") + 1)))
    .filter(Boolean);
  const external = metadata.dates?.published;
  row(
    "Published date",
    dates.length ? dates : null,
    external,
    dates.length === 1 && dates[0] === external,
  );
  return {
    status:
      metadata.status !== "found"
        ? "uncertain"
        : findings.every((f) => f.status === "match")
          ? "clear"
          : "uncertain",
    findings,
    sources: {
      lookup: metadata.source || null,
      pdf: paper.findings?.map((f) => ({ field: f.name, source: f.source })),
    },
    reason:
      "Conservative text comparison; inspect the PDF page evidence. A match is not identity proof.",
  };
}
export function matchAuthor(faculty, metadata) {
  const matches = (metadata.authors || [])
    .map((a, i) => ({ name: a.name, position: i + 1 }))
    .filter((a) => normalize(a.name) === normalize(faculty));
  return {
    status:
      metadata.status === "found" &&
      matches.length === 1 &&
      matches[0].position === 1
        ? "clear"
        : "uncertain",
    primary:
      matches.length === 1
        ? matches[0].position === 1
          ? "yes"
          : "no"
        : "unknown",
    faculty,
    matched: matches,
    reason:
      matches.length === 1 && matches[0].position === 1
        ? "Exact normalized name match to the first-listed author."
        : matches.length
          ? "Only first-listed author scoring is currently supported."
          : "No unique exact name match. Appraiser must resolve identity; initials are not guessed.",
  };
}
export function checkPeriod(metadata, config) {
  const date = metadata.dates?.[config.dateRule];
  if (metadata.status !== "found" || !validDate(date))
    return {
      status: "uncertain",
      date: date || null,
      reason:
        "A complete publication date was not available for the selected date rule.",
    };
  return {
    status:
      date < config.start || date > config.end ? "ineligible" : "eligible",
    date,
    start: config.start,
    end: config.end,
    dateRule: config.dateRule,
    source: metadata.source,
  };
}
export function checkIndex(metadata, registry) {
  const record = (registry || []).find(
    (r) => normalizeDoi(r.doi) === metadata.doi,
  );
  const date = metadata.dates?.published;
  const covered =
    metadata.status === "found" &&
    record &&
    validDate(date) &&
    date >= record.start &&
    date <= record.end;
  return {
    status: covered ? "found" : "unknown",
    scopus: covered ? record.scopus : "unknown",
    wos: covered ? record.wos : "unknown",
    sae: covered ? record.sae : "unknown",
    simulated: true,
    scope: "paper",
    date: date || null,
    source: covered
      ? record.source
      : "No mock paper record covering this publication date.",
    coverage: record ? { start: record.start, end: record.end } : null,
  };
}
export function checkDuplicates(metadata, faculty, records) {
  if (metadata.status !== "found" || !metadata.doi || !normalize(faculty))
    return {
      status: "uncertain",
      records: [],
      reason: "A verified lookup DOI and faculty name are needed.",
    };
  const matches = records.filter(
    (r) =>
      normalizeDoi(r.doi) === metadata.doi &&
      normalize(r.faculty) === normalize(faculty),
  );
  return {
    status: matches.length ? "candidate" : "clear",
    records: matches,
    doi: metadata.doi,
    faculty,
    scope:
      "Seed records and approved records in this session only. Name matching is not a persistent faculty identifier.",
  };
}
export function decide(checks) {
  const facts = {
    scopus: checks.index?.scopus || "unknown",
    wos: checks.index?.wos || "unknown",
    sae: checks.index?.sae || "unknown",
    primary: checks.author?.primary || "unknown",
    period: checks.period?.status || "uncertain",
    duplicate: checks.duplicate?.status || "uncertain",
  };
  const reasons = [];
  if (checks.comparison?.status !== "clear")
    reasons.push("PDF and external metadata need reconciliation.");
  if (checks.author?.status !== "clear")
    reasons.push("First authorship is not uniquely established.");
  if (facts.period === "uncertain")
    reasons.push("Assessment eligibility is uncertain.");
  if (facts.duplicate !== "clear")
    reasons.push("Duplicate finding needs review.");
  if (facts.scopus === "unknown" || facts.wos === "unknown")
    reasons.push("Scopus or WOS evidence is missing.");
  if (facts.scopus === "no" && facts.wos === "no")
    reasons.push(
      facts.sae === "yes"
        ? "SAE scoring has not been agreed."
        : "No supported index confirmed; eligibility policy needs review.",
    );
  return {
    status:
      facts.period === "ineligible"
        ? "ineligible"
        : reasons.length
          ? "uncertain"
          : "clear",
    facts,
    reasons:
      facts.period === "ineligible"
        ? [
            "Publication is outside the configured assessment period.",
            ...reasons,
          ]
        : reasons,
    checks,
    simulated: !!checks.index?.simulated,
  };
}
export function calculateScore(decision, policy) {
  const errors = validatePolicy(policy);
  if (errors.length) throw Error(errors.join(" "));
  const base = {
    policy: structuredClone(policy),
    policyVersion: policy.version,
    simulated: !!decision.simulated,
  };
  if (decision.status === "ineligible")
    return {
      ...base,
      status: "scored",
      points: 0,
      trace: ["Confirmed outside assessment period → 0 points."],
    };
  if (
    decision.status !== "clear" ||
    decision.facts.primary !== "yes" ||
    decision.facts.period !== "eligible" ||
    decision.facts.duplicate !== "clear" ||
    ["scopus", "wos"].some((k) => !["yes", "no"].includes(decision.facts[k]))
  )
    return {
      ...base,
      status: "pending",
      points: null,
      trace: ["Unresolved findings: scoring is pending."],
    };
  const trace = [];
  for (const r of policy.rules) {
    const matches = r.conditions.map((c) =>
      c.op === "eq"
        ? decision.facts[c.fact] === c.value
        : decision.facts[c.fact] !== c.value,
    );
    const match =
      r.match === "all" ? matches.every(Boolean) : matches.some(Boolean);
    trace.push(`${r.name}: ${match ? "matched" : "not matched"}`);
    if (match)
      return {
        ...base,
        status: "scored",
        points: Math.round(Number(r.points) * Number(r.multiplier) * 100) / 100,
        rule: r.name,
        trace: [...trace, `${r.points} × ${r.multiplier}`],
      };
  }
  return {
    ...base,
    status: "pending",
    points: null,
    trace: [...trace, "No rule matched. Appraiser review required."],
  };
}
export function assist(decision, mode) {
  return {
    status: mode === "simulated" ? "simulated" : "not-connected",
    simulated: mode === "simulated",
    summary:
      mode === "simulated"
        ? "Simulated assistance: ask the appraiser to resolve the findings below. No AI model was called."
        : "Live AI is not connected. Findings have been passed to the appraiser without an AI opinion.",
    questions: (decision?.reasons || []).map((reason) => ({
      finding: reason,
      action:
        "Inspect the original evidence; request clarification or record a reasoned override.",
    })),
    decision,
  };
}
export async function liveAssistance(
  decision,
  fetcher = fetch,
  instructions = DEFAULT_AI_INSTRUCTIONS,
) {
  const prepared = prepareAIInput(decision);
  if (prepared.truncated)
    return {
      status: "unavailable",
      inputTruncated: true,
      summary:
        "AI input exceeds the supported size (100,000 text characters or structure limits). No model was called. Use a smaller document or evaluate sections separately; automatic chunking is not available.",
      questions: [],
    };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50000);
  try {
    const response = await fetcher("/api/ai-assistance", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: prepared, instructions }),
    });
    if (!response.ok) throw Error();
    const result = await response.json();
    return { ...result, decision };
  } catch {
    return {
      status: "unavailable",
      summary: "AI assistance could not complete. Continue with human review.",
      questions: [],
      decision,
    };
  } finally {
    clearTimeout(timer);
  }
}
export function typedValue(value, type) {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && !value.trim())
  )
    return null;
  if (type === "number")
    return ["string", "number"].includes(typeof value) &&
      Number.isFinite(Number(value))
      ? Number(value)
      : null;
  if (type === "date") return validDate(value) ? value : null;
  if (type === "boolean")
    return [true, "true", "Yes"].includes(value)
      ? true
      : [false, "false", "No"].includes(value)
        ? false
        : null;
  return type === "text" && typeof value === "string" ? value : null;
}
function validateStructuredAI(text, schemaText) {
  if (!schemaText?.trim()) return null;
  const schema = JSON.parse(schemaText);
  let value;
  try {
    value = JSON.parse(String(text).replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    throw Error("AI evaluation did not return valid JSON for the configured schema.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("AI evaluation must return a JSON object.");
  for (const key of schema.required || [])
    if (!Object.hasOwn(value, key))
      throw Error(`AI evaluation is missing required field: ${key}.`);
  for (const [key, rule] of Object.entries(schema.properties || {})) {
    if (!Object.hasOwn(value, key)) continue;
    const actual = Array.isArray(value[key]) ? "array" : typeof value[key];
    if (rule.type && actual !== rule.type)
      throw Error(`AI evaluation field ${key} must be ${rule.type}.`);
    if (rule.enum && !rule.enum.includes(value[key]))
      throw Error(`AI evaluation field ${key} is outside the allowed values.`);
  }
  return value;
}
export async function executeNode(node, input, ctx) {
  if (["action", "plugin"].includes(node.kind))
    return executeNode(
      { ...node, kind: node.config.tool, config: node.config.settings },
      input,
      ctx,
    );
  if (node.kind === "apply_policy") {
    const policy = ctx.policyVersions?.find(
      (p) => p.version === node.config.policyVersion,
    );
    if (!policy) throw Error("Selected policy version is missing.");
    const scoring = evaluateScoringVersion(policy, {
      values: ctx.values,
      outputs: ctx.outputs,
      result: {},
    });
    return { scoring, points: scoring.points, status: scoring.status };
  }
  const reusable = await executeReusable(node, input, ctx);
  if (reusable) return reusable;
  if (node.kind.startsWith("read_"))
    return { value: typedValue(input.value, node.kind.slice(5)) };
  if (node.kind === "condition") {
    const actual = typedValue(input.value, node.config.valueType),
      expected = typedValue(node.config.expected, node.config.valueType);
    const met =
      node.config.operator === "eq"
        ? actual === expected
        : node.config.operator === "ne"
          ? actual !== expected
          : node.config.operator === "gte"
            ? actual >= expected
            : actual <= expected;
    return {
      condition: {
        status:
          actual === null || expected === null
            ? "uncertain"
            : met
              ? "clear"
              : "failed",
        actual,
        expected,
        operator: node.config.operator,
        valueType: node.config.valueType,
      },
    };
  }
  if (node.kind === "human_review")
    return {
      review: {
        status: "awaiting-review",
        role: node.config.role,
        instructions: node.config.instructions,
        package: {
          submission: { values: ctx.values },
          extraction: Object.values(ctx.outputs).flatMap((output) =>
            output.evidence ? [output.evidence] : [],
          ),
          comparison: Object.values(ctx.outputs).flatMap((output) =>
            output.comparison ? [output.comparison] : [],
          ),
          aiRecommendation: Object.values(ctx.outputs).flatMap((output) =>
            output.assistance ? [output.assistance] : [],
          ),
          scoring: Object.values(ctx.outputs).flatMap((output) =>
            output.scoring || output.score
              ? [output.scoring || output.score]
              : [],
          ),
          policyVersions: ctx.policyVersions || [],
        },
      },
    };
  if (node.kind === "result")
    return {
      result: {
        outcome: node.config.outcome,
        value: typedValue(input.value, node.config.valueType),
      },
    };

  switch (node.kind) {
    case "submit": {
      const errors = validateSubmission(ctx.fields, ctx.values);
      if (errors.length) throw Error(errors.join(" "));
      return {
        submission: {
          values: ctx.values,
          receivedAt: new Date().toISOString(),
        },
      };
    }
    case "extract": {
      if (!Array.isArray(input.file) || input.file.length !== 1)
        throw Error("Choose exactly one PDF in the mapped paper field.");
      const paper = await ctx.extract(input.file[0]);
      return { paper, doi: candidate(paper, "DOI") || [] };
    }
    case "lookup": {
      const selected = [
        ...(Array.isArray(input.doi) ? input.doi : [input.doi]),
        ...(Array.isArray(input.claimedDoi)
          ? input.claimedDoi
          : [input.claimedDoi]),
      ]
        .filter(Boolean)
        .map(normalizeDoi);
      const urlDoi = normalizeDoi(input.url);
      const candidates = [
        ...new Set([...selected, ...(urlDoi ? [urlDoi] : [])].filter(Boolean)),
      ];
      if (candidates.length !== 1 || selected.some((x) => !x))
        return {
          metadata: {
            status: "unknown",
            reason:
              candidates.length > 1
                ? "Conflicting DOI candidates. Resolve the identifiers before lookup."
                : "No unique valid DOI. Enter a DOI or a URL containing one.",
            candidates,
          },
        };
      return { metadata: await ctx.lookup(candidates[0]) };
    }
    case "compare":
      return { comparison: compareEvidence(input.paper, input.metadata) };
    case "author":
      return { author: matchAuthor(input.faculty, input.metadata) };
    case "period":
      return { period: checkPeriod(input.metadata, node.config) };
    case "index":
      return { index: checkIndex(input.metadata, node.config.registry) };
    case "duplicate":
      return {
        duplicate: checkDuplicates(input.metadata, input.faculty, [
          ...(node.config.records || []),
          ...ctx.records,
        ]),
      };
    case "decision": {
      const decision = decide(input);
      return { decision, status: decision.status };
    }
    case "ai": {
      const instructions = node.config.instructions ?? DEFAULT_AI_INSTRUCTIONS;
      if (
        input.decision === undefined ||
        input.decision === null ||
        input.decision === ""
      )
        return {
          assistance: {
            status: "unavailable",
            summary: "The selected AI input is missing. No model was called.",
            instructions,
          },
          response: "The selected AI input is missing.",
        };
      const additional = (node.config.contextInputs || []).map((f) => ({
        name: f.name,
        value: input[f.id],
      }));
      if (
        additional.some(
          (f) => f.value === undefined || f.value === null || f.value === "",
        )
      )
        return {
          assistance: {
            status: "unavailable",
            summary:
              "An additional AI input is missing. Supply the selected topic or reference material before evaluation.",
            instructions,
          },
          response: "Additional AI input is missing.",
        };
      const payload =
        additional.length ||
        node.config.referenceText?.trim() ||
        node.config.outputSchema?.trim()
          ? {
              primaryInput: input.decision,
              additionalInputs: additional,
              referenceMaterial: node.config.referenceText?.trim() || null,
              outputSchema: node.config.outputSchema?.trim()
                ? JSON.parse(node.config.outputSchema)
                : null,
            }
          : input.decision;
      const schemaInstruction = node.config.outputSchema?.trim()
        ? `${instructions}\n\nReturn only JSON matching this schema:\n${node.config.outputSchema}`
        : instructions;
      const response =
        node.config.mode === "openrouter"
          ? await (ctx.ai || liveAssistance)(
              payload,
              undefined,
              schemaInstruction,
            )
          : assist(payload, node.config.mode);
      const structured =
        node.config.mode === "openrouter" && response.status !== "unavailable"
          ? validateStructuredAI(response.summary, node.config.outputSchema)
          : null;
      const assistance = {
        ...response,
        instructions,
        rubric: node.config.referenceText?.trim() || null,
        outputSchema: node.config.outputSchema?.trim()
          ? JSON.parse(node.config.outputSchema)
          : null,
        structured,
      };
      if (node.config.mode === "simulated")
        assistance.summary =
          "Simulated AI response. No model was called and your instructions were not executed. Switch to OpenRouter to generate a response.";
      return {
        assistance,
        response: assistance.summary,
        ...(structured || {}),
      };
    }
    case "score": {
      const score = calculateScore(input.decision, node.config.policy);
      return { score, points: score.points };
    }
    case "review":
      return {
        review: {
          status: "awaiting-review",
          decision: input.decision,
          score: input.score || null,
          assistance: input.assistance || null,
        },
      };
    default:
      throw Error("Unknown tool.");
  }
}
const resumedRuns = new WeakSet();
export async function resumeWorkflow(run, decision, onStep = () => {}) {
  if (
    run.status !== "awaiting-review" ||
    !run.genericReview ||
    resumedRuns.has(run)
  )
    throw Error("This review is no longer awaiting a decision.");
  if (!decision.reviewer?.trim()) throw Error("Enter the reviewer name.");
  if (
    !["approved", "rejected", "clarification", "override"].includes(
      decision.action,
    )
  )
    throw Error("Choose a review decision.");
  if (decision.action !== "approved" && !decision.reason?.trim())
    throw Error("Enter a reason for this decision.");
  if (
    decision.action === "override" &&
    (decision.points === "" ||
      !Number.isFinite(Number(decision.points)) ||
      Number(decision.points) < 0)
  )
    throw Error("Enter a non-negative override score.");
  const recorded = {
    action: decision.action,
    reviewer: decision.reviewer.trim(),
    reason: decision.reason?.trim() || "",
    finalStatus: decision.action === "override" ? "approved" : decision.action,
    finalScore: decision.action === "override" ? Number(decision.points) : null,
    evidencePackage: run.review.package,
    at: new Date().toISOString(),
  };
  const node = run.snapshot.find((n) => n.id === run.reviewNode);
  resumedRuns.add(run);
  const outputs = { ...run.outputs, [node.id]: { review: recorded } };
  const trace = run.trace.map((step) =>
    step.id === node.id ? { ...step, output: { review: recorded } } : step,
  );
  return continueWorkflow(
    { ...run.context, nodes: run.snapshot, onStep },
    {
      outputs,
      trace,
      id: node.routes[decision.action === "override" ? "approved" : decision.action],
      snapshot: run.snapshot,
      decisions: [...run.decisions, recorded],
    },
  );
}
export function validateRunConfiguration({ nodes, fields, policy }) {
  const issues = validateWorkflow(nodes, fields);
  for (const original of nodes) {
    const n = ["action", "plugin"].includes(original.kind)
      ? {
          ...original,
          kind: original.config.tool,
          config: original.config.settings,
        }
      : original;
    if (n.kind === "apply_policy") {
      const v = policy?.versions?.find(
        (v) => v.version === n.config.policyVersion,
      );
      issues.push(
        ...validateScoringVersion(
          v,
          fields,
          nodes.slice(0, nodes.indexOf(original)),
        ).map((e) => `${n.name}: ${e}`),
      );
      if (
        v?.rules.some((r) =>
          r.conditions.some((c) => c.source.startsWith("result|")),
        )
      )
        issues.push(
          `${n.name}: final outcome is unavailable before Result. Use inputs or earlier outputs.`,
        );
    }
  }

  if (policy?.enabled) {
    const selected = policy.versions.find(
      (v) => v.version === policy.activeVersion,
    );
    issues.push(...validateScoringVersion(selected, fields, nodes));
    if (
      nodes.some(
        (n) =>
          n.kind === "review" ||
          (n.kind === "plugin" && n.config.tool === "review"),
      ) ||
      !nodes.some((n) => n.kind === "result")
    )
      issues.push(
        "This policy needs Result endings. Legacy Appraiser review uses its existing publication policy.",
      );
  }
  return [...new Set(issues)];
}
export async function runWorkflow(options) {
  const { nodes } = options;
  const issues = validateRunConfiguration(options);
  if (issues.length) return { status: "invalid", issues, trace: [] };
  const scoringPolicy = options.policy?.enabled
    ? structuredClone(
        options.policy.versions.find(
          (v) => v.version === options.policy.activeVersion,
        ),
      )
    : null;
  const snapshot = structuredClone(nodes);
  return continueWorkflow(
    {
      ...options,
      policyVersions: structuredClone(options.policy?.versions || []),
      scoringPolicy,
      nodes: snapshot,
    },
    {
      outputs: {},
      trace: [],
      id: snapshot.find((n) => n.kind === "submit").id,
      snapshot,
      decisions: [],
    },
  );
}
async function continueWorkflow(options, state) {
  const {
    nodes,
    fields,
    values,
    scoringPolicy,
    records = [],
    policyVersions = [],
    extract,
    lookup = lookupPublication,
    ai = liveAssistance,
    onStep = () => {},
  } = options;
  const { outputs, trace, snapshot, decisions } = state;
  let id = state.id;
  const seen = new Set(trace.map((s) => s.id));
  while (id) {
    const node = nodes.find((n) => n.id === id);
    if (!node || seen.has(id))
      return {
        status: "error",
        issues: ["Invalid route or repeated node."],
        trace,
        snapshot,
        decisions,
      };
    seen.add(id);
    const startedAt = new Date().toISOString();
    onStep({ id, status: "running" });
    try {
      const input = {};
      for (const p of nodeDefinition(node).inputs) {
        const s = node.mappings[p.key];
        if (!s) {
          if (!p.optional) throw Error(`Missing ${p.label}.`);
          continue;
        }
        const [origin, source, key] = s.split("|");
        const value =
          origin === "field" ? values[source] : outputs[source]?.[key];
        if (value === undefined && origin !== "field" && !p.optional)
          throw Error(`${p.label} is unavailable on this route.`);
        input[p.key] = value;
      }
      const output = await executeNode(node, input, {
        fields,
        values,
        records,
        extract,
        lookup,
        ai,
        outputs,
        policyVersions,
      });
      outputs[id] = output;
      trace.push({
        id,
        name: node.name,
        kind: ["action", "plugin"].includes(node.kind)
          ? node.config.tool
          : node.kind,
        startedAt,
        completedAt: new Date().toISOString(),
        output,
      });
      onStep({ id, status: "done", trace: [...trace] });
      const effectiveKind =
        node.kind === "plugin" ? node.config.tool : node.kind;
      if (["review", "human_review"].includes(effectiveKind))
        return {
          id: crypto.randomUUID(),
          status: "awaiting-review",
          trace,
          outputs,
          review: output.review,
          snapshot,
          reviewNode: id,
          genericReview: node.kind === "human_review",
          decisions,
          context: {
            policyVersions,
            scoringPolicy,
            fields: structuredClone(fields),
            values: { ...values },
            records: [...records],
            extract,
            lookup,
            ai,
          },
        };
      if (node.kind === "result")
        return {
          status: "completed",
          trace,
          outputs,
          snapshot,
          result: output.result,
          decisions,
          scoring: scoringPolicy
            ? evaluateScoringVersion(scoringPolicy, {
                values,
                outputs,
                result: output.result,
              })
            : null,
        };
      const route =
        effectiveKind === "decision"
          ? output.decision.status
          : node.kind === "condition"
            ? output.condition.status
            : "next";
      id = node.routes[route];
      if (!id) throw Error(`Connect the ${route} route.`);
    } catch (e) {
      trace.push({
        id: node.id,
        name: node.name,
        kind: node.kind,
        status: "error",
        error: e.message,
        startedAt,
      });
      return {
        status: "error",
        trace,
        issues: [e.message],
        snapshot,
        decisions,
      };
    }
  }
  return {
    status: "error",
    trace,
    issues: ["Workflow ended without a Result or review."],
    snapshot,
    decisions,
  };
}
export function finalizeReview(run, { action, reason, points, reviewer }) {
  if (run.status !== "awaiting-review")
    throw Error("This run is no longer awaiting review.");
  if (!reviewer?.trim()) throw Error("Enter the appraiser name.");
  if (!["approve", "reject", "clarify", "override"].includes(action))
    throw Error("Choose an appraiser decision.");
  if (action !== "approve" && !reason?.trim())
    throw Error("A reason is required.");
  const recommendation =
    run.review.score?.points ??
    (run.review.decision.status === "ineligible" ? 0 : null);
  if (action === "approve" && recommendation === null)
    throw Error("Unresolved cases need clarification or a reasoned override.");
  if (
    action === "override" &&
    (points === "" || !Number.isFinite(Number(points)) || Number(points) < 0)
  )
    throw Error("Enter a non-negative override score.");
  return {
    action,
    reviewer: reviewer.trim(),
    reason: reason?.trim() || "",
    originalScore: recommendation,
    approvedScore:
      action === "approve"
        ? recommendation
        : action === "override"
          ? Number(points)
          : action === "reject"
            ? 0
            : null,
    at: new Date().toISOString(),
    simulated: run.review.decision.simulated,
    runId: run.id,
  };
}
