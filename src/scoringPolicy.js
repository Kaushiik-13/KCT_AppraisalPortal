import { nodeDefinition, FACTS } from "./workflowModel.js";

export const newScoreComponent = () => ({
  id: crypto.randomUUID(),
  name: "New score component",
  weight: "1",
  required: true,
});
export const newScoringPolicy = () => ({
  enabled: false,
  activeVersion: "",
  versions: [],
  draft: {
    version: "v1",
    mode: "rules",
    aggregation: "sum",
    maxPoints: "",
    fallback: "pending",
    components: [],
    rules: [],
  },
});
export const newScoringRule = () => ({
  id: crypto.randomUUID(),
  name: "New rule",
  match: "all",
  conditions: [
    { source: "result|outcome", type: "text", operator: "eq", expected: "" },
  ],
  points: "12",
  multiplier: "1",
  outcome: "Eligible",
});
const scalarTypes = ["text", "number", "date", "boolean"];
export function policySources(fields, nodes) {
  const choices = [
    { value: "result|outcome", label: "Final workflow outcome", type: "text" },
  ];
  const fieldType = {
    integer: "number",
    textarea: "text",
    email: "text",
    url: "text",
    select: "text",
  };
  for (const f of fields) {
    const type = fieldType[f.type] || f.type;
    if (scalarTypes.includes(type))
      choices.push({
        value: `field|${f.id}`,
        label: `Input: ${f.label}`,
        type,
      });
  }
  for (const n of nodes) {
    for (const p of nodeDefinition(n)?.outputs || [])
      if (scalarTypes.includes(p.type))
        choices.push({
          value: `node|${n.id}|${p.key}`,
          label: `${n.name}: ${p.label}`,
          type: p.type,
        });
    const kind = ["action", "plugin"].includes(n.kind) ? n.config.tool : n.kind;
    const paths =
      kind === "decision"
        ? Object.keys(FACTS).map((k) => `decision.facts.${k}`)
        : kind === "index"
          ? ["index.scopus", "index.wos", "index.sae"]
          : kind === "author"
            ? ["author.primary"]
            : kind === "period"
              ? ["period.status"]
              : kind === "duplicate"
                ? ["duplicate.status"]
                : kind === "human_review"
                  ? ["review.status"]
                  : kind === "condition"
                    ? ["condition.status"]
                    : [];
    for (const path of paths)
      choices.push({
        value: `node|${n.id}|${path}`,
        label: `${n.name}: ${path.split(".").at(-1)}`,
        type: "text",
      });
  }
  return choices;
}
function scalar(v, type) {
  if (v === null || v === undefined || (typeof v === "string" && !v.trim()))
    return null;
  if (type === "number")
    return ["number", "string"].includes(typeof v) && Number.isFinite(Number(v))
      ? Number(v)
      : null;
  if (type === "boolean")
    return [true, "true", "Yes"].includes(v)
      ? true
      : [false, "false", "No"].includes(v)
        ? false
        : null;
  if (type === "date")
    return typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      Number.isFinite(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v
      ? v
      : null;
  return type === "text" && typeof v === "string" ? v : null;
}
const nonnegative = (v) =>
  v !== "" &&
  v !== null &&
  !(typeof v === "string" && !v.trim()) &&
  ["string", "number"].includes(typeof v) &&
  Number.isFinite(Number(v)) &&
  Number(v) >= 0;
const normalizedVersion = (v) => ({
  ...v,
  mode: v.mode || "rules",
  aggregation: v.aggregation || "sum",
  components: v.components || [],
  rules: v.rules || [],
});
export function validPolicyShape(p) {
  const version = (value) => {
    if (
      !value ||
      typeof value.version !== "string" ||
      !["string", "number"].includes(typeof value.maxPoints) ||
      !["pending", "zero"].includes(value.fallback)
    )
      return false;
    const v = normalizedVersion(value);
    if (
      !["rules", "formula"].includes(v.mode) ||
      !["sum", "average", "weighted_average"].includes(v.aggregation) ||
      !Array.isArray(v.components) ||
      !Array.isArray(v.rules)
    )
      return false;
    if (
      !v.components.every(
        (c) =>
          c &&
          typeof c.id === "string" &&
          typeof c.name === "string" &&
          ["string", "number"].includes(typeof c.weight) &&
          typeof c.required === "boolean",
      )
    )
      return false;
    return v.rules.every(
      (r) =>
        r &&
        ["id", "name", "match", "outcome"].every(
          (k) => typeof r[k] === "string",
        ) &&
        ["points", "multiplier"].every((k) =>
          ["number", "string"].includes(typeof r[k]),
        ) &&
        Array.isArray(r.conditions) &&
        r.conditions.every(
          (c) =>
            c &&
            ["source", "type", "operator", "expected"].every(
              (k) => typeof c[k] === "string",
            ),
        ),
    );
  };
  return (
    !!p &&
    typeof p.enabled === "boolean" &&
    typeof p.activeVersion === "string" &&
    version(p.draft) &&
    Array.isArray(p.versions) &&
    p.versions.every(version) &&
    new Set(p.versions.map((v) => v.version)).size === p.versions.length
  );
}
export function validateScoringVersion(value, fields, nodes) {
  if (!value) return ["Save a policy version first."];
  const version = normalizedVersion(value),
    errors = [],
    sources = policySources(fields, nodes);
  if (!version.version.trim()) errors.push("Enter a policy version name.");
  if (version.maxPoints !== "" && !nonnegative(version.maxPoints))
    errors.push("The score cap must be zero or a positive number.");
  if (version.mode === "formula") {
    if (!version.components.length)
      errors.push("Add at least one score component.");
    if (!["sum", "average", "weighted_average"].includes(version.aggregation))
      errors.push("Choose a score aggregation method.");
    if (
      new Set(version.components.map((c) => c.id)).size !==
      version.components.length
    )
      errors.push("Score component IDs must be unique.");
    for (const c of version.components)
      if (
        !c.name.trim() ||
        !nonnegative(c.weight) ||
        (version.aggregation === "weighted_average" && Number(c.weight) === 0)
      )
        errors.push(
          version.aggregation === "weighted_average"
            ? "Every score component needs a name and a positive weight."
            : "Every score component needs a name and a non-negative weight.",
        );
  } else {
    if (!version.rules.length) errors.push("Add at least one scoring rule.");
    for (const r of version.rules) {
      if (!r.name.trim() || !r.outcome.trim())
        errors.push("Each rule needs a name and an outcome.");
      if (!["all", "any"].includes(r.match) || !r.conditions.length)
        errors.push(`${r.name}: add conditions and choose all or any.`);
      if (
        !nonnegative(r.points) ||
        !nonnegative(r.multiplier) ||
        !Number.isFinite(Number(r.points) * Number(r.multiplier))
      )
        errors.push(
          `${r.name}: points and multiplier must give a finite, non-negative score.`,
        );
      for (const c of r.conditions) {
        const source = sources.find((s) => s.value === c.source);
        if (!source || source.type !== c.type)
          errors.push(
            `${r.name}: a condition source was removed or changed type.`,
          );
        if (
          ![
            "eq",
            "ne",
            ...(["number", "date"].includes(c.type) ? ["gte", "lte"] : []),
          ].includes(c.operator) ||
          scalar(c.expected, c.type) === null
        )
          errors.push(`${r.name}: enter a valid comparison value.`);
      }
    }
  }
  return [...new Set(errors)];
}
export function saveScoringVersion(policy, fields, nodes) {
  const draft = {
    ...normalizedVersion(policy.draft),
    version: policy.draft.version.trim(),
  };
  const issues = validateScoringVersion(draft, fields, nodes);
  if (issues.length) throw Error(issues.join(" "));
  if (policy.versions.some((v) => v.version === draft.version))
    throw Error(
      "That version is already saved. Use a new version name to keep earlier rules unchanged.",
    );
  return {
    ...policy,
    activeVersion: draft.version,
    versions: [...policy.versions, structuredClone(draft)],
  };
}
function evaluateFormula(policy, componentValues = {}) {
  const base = {
    version: policy.version,
    policy: structuredClone(policy),
    aggregation: policy.aggregation,
  };
  const trace = [];
  const available = [];
  for (const component of policy.components) {
    const value = scalar(componentValues[component.id], "number");
    trace.push({
      component: component.name,
      value,
      weight: Number(component.weight),
      required: component.required,
    });
    if (value === null) {
      if (component.required)
        return {
          ...base,
          status: "pending",
          points: null,
          outcome: "Pending evidence",
          components: trace,
          trace: [`${component.name} is required but missing.`],
        };
      continue;
    }
    available.push({
      value,
      weight: Number(component.weight),
      name: component.name,
    });
  }
  if (!available.length)
    return {
      ...base,
      status: "pending",
      points: null,
      outcome: "Pending evidence",
      components: trace,
      trace: ["No score component has a usable value."],
    };
  let raw;
  if (policy.aggregation === "average")
    raw =
      available.reduce((sum, item) => sum + item.value, 0) / available.length;
  else if (policy.aggregation === "weighted_average") {
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    if (!totalWeight)
      return {
        ...base,
        status: "pending",
        points: null,
        outcome: "Pending evidence",
        components: trace,
        trace: ["The available component weights total zero."],
      };
    raw =
      available.reduce((sum, item) => sum + item.value * item.weight, 0) /
      totalWeight;
  } else
    raw = available.reduce((sum, item) => sum + item.value * item.weight, 0);
  const capped =
    policy.maxPoints === "" ? raw : Math.min(raw, Number(policy.maxPoints));
  return {
    ...base,
    status: "scored",
    points: Number(capped.toFixed(2)),
    outcome: "Calculated",
    components: trace,
    trace: [
      `${policy.aggregation} produced ${Number(raw.toFixed(2))}${policy.maxPoints !== "" ? `; capped at ${policy.maxPoints}` : ""}.`,
    ],
  };
}
export function evaluateScoringVersion(
  value,
  { values = {}, outputs = {}, result = {}, componentValues = {} } = {},
) {
  const policy = normalizedVersion(value);
  if (policy.mode === "formula")
    return evaluateFormula(policy, componentValues);
  const trace = [],
    base = { version: policy.version, policy: structuredClone(policy) };
  const pending = (reason) => ({
    ...base,
    status: "pending",
    points: null,
    outcome: "Pending review",
    trace: [...trace, reason],
  });
  for (const r of policy.rules) {
    const checks = r.conditions.map((c) => {
      const [origin, id, path] = c.source.split("|");
      const raw =
        origin === "result"
          ? result.outcome
          : origin === "field"
            ? values[id]
            : (path || "").split(".").reduce((v, k) => v?.[k], outputs[id]);
      const actual = scalar(raw, c.type),
        expected = scalar(c.expected, c.type);
      const match =
        actual === null
          ? null
          : c.operator === "eq"
            ? actual === expected
            : c.operator === "ne"
              ? actual !== expected
              : c.operator === "gte"
                ? actual >= expected
                : actual <= expected;
      return {
        source: c.source,
        actual,
        expected,
        operator: c.operator,
        match,
      };
    });
    const match =
      r.match === "all"
        ? checks.some((c) => c.match === false)
          ? false
          : checks.some((c) => c.match === null)
            ? null
            : true
        : checks.some((c) => c.match === true)
          ? true
          : checks.some((c) => c.match === null)
            ? null
            : false;
    trace.push({ rule: r.name, match, checks });
    if (match === null)
      return pending(
        `Cannot decide rule "${r.name}" because evidence is missing. Later rules were not used.`,
      );
    if (match) {
      const rawPoints = Number(r.points) * Number(r.multiplier),
        capped =
          policy.maxPoints === ""
            ? rawPoints
            : Math.min(rawPoints, Number(policy.maxPoints));
      return {
        ...base,
        status: "scored",
        points: Number(capped.toFixed(2)),
        outcome: r.outcome,
        rule: r.name,
        trace: [
          ...trace,
          `${r.points} x ${r.multiplier} = ${rawPoints}${policy.maxPoints !== "" ? `; cap ${policy.maxPoints}` : ""}`,
        ],
      };
    }
  }
  return policy.fallback === "zero"
    ? {
        ...base,
        status: "scored",
        points: 0,
        outcome: "No matching rule",
        trace: [...trace, "No rule matched: configured fallback is zero."],
      }
    : pending("No rule matched: pending review.");
}
