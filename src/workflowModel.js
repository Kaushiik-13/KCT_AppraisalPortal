import {
  reusableTools,
  legacyReusableTools,
  reusableDefaults,
  reusableDefinition,
} from "./reusableTools.js";
import { DEFAULT_AI_INSTRUCTIONS } from "./aiContext.js";
const port = (key, label, type, options = {}) => ({
  key,
  label,
  type,
  ...options,
});
export const tools = [
  {
    kind: "submit",
    name: "Submission received",
    description:
      "Validate the submission form once. Every later step reuses this submission.",
    inputs: [],
    outputs: [port("submission", "Submission record", "submission")],
    routes: ["next"],
  },
  {
    kind: "extract",
    name: "Extract paper details",
    description:
      "Read the PDF locally and keep page evidence. Scanned or ambiguous content stays uncertain.",
    inputs: [port("file", "Paper PDF", "file")],
    outputs: [
      port("paper", "Extracted details", "paper"),
      port("doi", "DOI found in the paper", "doi"),
    ],
    routes: ["next"],
  },
  {
    kind: "lookup",
    name: "Look up publication",
    description:
      "Look up a DOI in Crossref. A DOI link or a publication URL containing a DOI is supported. This does not verify indexing.",
    inputs: [
      port("doi", "DOI to look up", "doi", { optional: true }),
      port(
        "claimedDoi",
        "DOI entered in the form (cross-check, optional)",
        "doi",
        { optional: true },
      ),
      port("url", "Publication URL (optional)", "url", { optional: true }),
    ],
    outputs: [port("metadata", "Publication record", "metadata")],
    routes: ["next"],
  },
  {
    kind: "compare",
    name: "Compare evidence",
    description:
      "Compare the PDF with the publication record. Keep both values when they disagree.",
    inputs: [
      port("paper", "Details from the PDF", "paper"),
      port("metadata", "Record from publication lookup", "metadata"),
    ],
    outputs: [port("comparison", "Comparison findings", "comparison")],
    routes: ["next"],
  },
  {
    kind: "author",
    name: "Check first author",
    description:
      "Match the faculty name to the first author in the publication record. Other author positions go to review.",
    inputs: [
      port("faculty", "Faculty name", "text"),
      port("metadata", "Author list from publication lookup", "metadata"),
    ],
    outputs: [port("author", "First-author finding", "author")],
    routes: ["next"],
  },
  {
    kind: "period",
    name: "Check assessment dates",
    description:
      "Use the publication date you choose and compare it with the assessment period, including both boundary dates.",
    inputs: [port("metadata", "Publication dates from lookup", "metadata")],
    outputs: [port("period", "Assessment-period finding", "period")],
    routes: ["next"],
  },
  {
    kind: "index",
    name: "Check indexing",
    description:
      "Use an editable mock registry for this PoC. These are simulated paper-level findings, not real Scopus or WOS verification.",
    inputs: [port("metadata", "Publication to check", "metadata")],
    outputs: [port("index", "Index findings (mock)", "index")],
    routes: ["next"],
  },
  {
    kind: "duplicate",
    name: "Check duplicates",
    description:
      "Compare DOI and faculty name against records approved in this browser session and any seed records you enter.",
    inputs: [
      port("metadata", "Publication identity", "metadata"),
      port("faculty", "Faculty name", "text"),
    ],
    outputs: [port("duplicate", "Duplicate finding", "duplicate")],
    routes: ["next"],
  },
  {
    kind: "decision",
    name: "Decide verification outcome",
    description:
      "Gather the checks. Missing or uncertain evidence goes to review; confirmed outside-period findings are ineligible.",
    inputs: [
      port("comparison", "Evidence comparison", "comparison"),
      port("author", "First-author check", "author"),
      port("period", "Assessment-period check", "period"),
      port("index", "Index check", "index"),
      port("duplicate", "Duplicate check", "duplicate"),
    ],
    outputs: [
      port("decision", "Verification outcome and scoring facts", "decision"),
      port("status", "Verification status", "text"),
    ],
    routes: ["clear", "uncertain", "ineligible"],
  },
  {
    kind: "ai",
    name: "AI evaluation",
    description:
      "Evaluate one or more structured inputs using creator instructions and return an advisory result for later conditions or review.",
    inputs: [port("decision", "Primary input", "ai_context")],
    outputs: [
      port("assistance", "AI evaluation and details", "assistance"),
      port("response", "Response text", "text"),
    ],
    routes: ["next"],
  },
  {
    kind: "score",
    name: "Calculate marks",
    description:
      "Build a versioned policy using conditions and points. The first matching rule wins. Unresolved facts remain pending.",
    inputs: [port("decision", "Verification outcome and facts", "decision")],
    outputs: [
      port("score", "Provisional score and calculation", "score"),
      port("points", "Provisional points", "number"),
    ],
    routes: ["next"],
  },
  {
    kind: "review",
    name: "Appraiser review",
    description:
      "Pause for approval, rejection, clarification, or an override with a reason. Keep the original recommendation.",
    inputs: [
      port("decision", "Verification outcome", "decision"),
      port("score", "Provisional score (optional)", "score", {
        optional: true,
      }),
      port("assistance", "Review assistance (optional)", "assistance", {
        optional: true,
      }),
    ],
    outputs: [port("review", "Appraiser decision", "review")],
    routes: [],
  },
];
export const blocks = [
  {
    kind: "action",
    name: "Action",
    description: "Choose a tool and connect the information it needs.",
    inputs: [],
    outputs: [],
    routes: ["next"],
  },
  {
    kind: "condition",
    name: "Condition",
    description:
      "Check a value and split into met, not met, or missing information.",
    inputs: [],
    outputs: [],
    routes: ["clear", "failed", "uncertain"],
  },
  {
    kind: "human_review",
    name: "Human review",
    description: "Ask a person to approve, reject, or request clarification.",
    inputs: [],
    outputs: [port("review", "Review decision", "review")],
    routes: ["approved", "rejected", "clarification"],
  },
  {
    kind: "result",
    name: "Result",
    description: "Finish this path with a named outcome and optional value.",
    inputs: [],
    outputs: [],
    routes: [],
  },
];
blocks.push({
  kind: "plugin",
  name: "Plugin",
  description: "Add a tool from an available plugin.",
  inputs: [],
  outputs: [],
  routes: ["next"],
});
export const publicationTools = tools.filter(
  (t) => !["submit", "ai"].includes(t.kind),
);
export const plugins = [
  {
    id: "publication",
    name: "Publication",
    description:
      "Paper extraction, Crossref lookup, authorship, indexing and publication scoring.",
    tools: publicationTools,
  },
];
export const generalTools = ["text", "number", "date", "boolean"].map(
  (type) => ({
    kind: `read_${type}`,
    name: `Read ${type} value`,
    description: "Use a submission value in later checks.",
    inputs: [port("value", "Input value", type)],
    outputs: [port("value", "Selected value", type)],
    routes: ["next"],
  }),
);
export const definition = (kind) =>
  [
    ...tools,
    ...blocks,
    ...generalTools,
    ...reusableTools,
    ...legacyReusableTools,
  ].find((t) => t.kind === kind);
export const actionTools = [
  ...reusableTools,
  ...legacyReusableTools,
  ...generalTools,
  ...tools.filter((t) => !["submit", "review"].includes(t.kind)),
];
export const reusableActionTools = [
  ...reusableTools,
  tools.find((t) => t.kind === "ai"),
];
export const valueTypes = ["text", "number", "date", "boolean"];
export function nodeDefinition(node) {
  const base = definition(node.kind);
  if (node.kind === "plugin")
    return node.config.tool
      ? {
          ...definition(node.config.tool),
          ...reusableDefinition({
            ...node,
            kind: node.config.tool,
            config: node.config.settings,
          }),
        }
      : base;
  if (node.kind === "action")
    return {
      ...base,
      ...(actionTools.find((t) => t.kind === node.config.tool) || {}),
      ...reusableDefinition({
        ...node,
        kind: node.config.tool,
        config: node.config.settings,
      }),
      routes: base.routes,
    };
  if (node.kind === "condition" || node.kind === "result")
    return {
      ...base,
      inputs: [
        port("value", "Value to use", node.config.valueType || "text", {
          optional: node.kind === "result",
        }),
      ],
    };
  return { ...base, ...reusableDefinition(node) };
}
export function chooseActionTool(node, kind) {
  const tool = createNode(kind);
  return {
    ...node,
    name:
      node.name === "Action" || actionTools.some((t) => t.name === node.name)
        ? tool.name
        : node.name,
    mappings: {},
    config: { tool: kind, settings: tool.config },
  };
}
export const FACTS = {
  scopus: ["yes", "no", "unknown"],
  wos: ["yes", "no", "unknown"],
  sae: ["yes", "no", "unknown"],
  primary: ["yes", "no", "unknown"],
  period: ["eligible", "ineligible", "uncertain"],
  duplicate: ["clear", "candidate", "uncertain"],
};
export const defaultPolicy = () => ({
  version: "publication-v1",
  rules: [
    {
      id: crypto.randomUUID(),
      name: "Both indexes · primary author",
      match: "all",
      conditions: [
        { fact: "scopus", op: "eq", value: "yes" },
        { fact: "wos", op: "eq", value: "yes" },
      ],
      points: 24,
      multiplier: 1,
    },
    {
      id: crypto.randomUUID(),
      name: "One index · primary author",
      match: "any",
      conditions: [
        { fact: "scopus", op: "eq", value: "yes" },
        { fact: "wos", op: "eq", value: "yes" },
      ],
      points: 12,
      multiplier: 1,
    },
  ],
  fallback: "pending",
});
export const defaultRegistry = () => [
  {
    doi: "10.1371/journal.pmed.1003583",
    scopus: "yes",
    wos: "yes",
    sae: "no",
    start: "2021-01-01",
    end: "2021-12-31",
    source: "SIMULATED PoC fixture. Not a factual indexing claim.",
  },
];
export function createNode(kind) {
  return {
    id: crypto.randomUUID(),
    kind,
    name: definition(kind).name,
    mappings: {},
    routes: Object.fromEntries(definition(kind).routes.map((r) => [r, ""])),
    config:
      reusableDefaults(kind) ??
      (kind === "plugin"
        ? { plugin: "publication", tool: "", settings: {} }
        : kind === "action"
          ? { tool: "", settings: {} }
          : kind === "condition"
            ? { valueType: "number", operator: "gte", expected: "" }
            : kind === "human_review"
              ? { role: "Appraiser", instructions: "" }
              : kind === "result"
                ? { outcome: "", valueType: "text" }
                : kind === "period"
                  ? { start: "", end: "", dateRule: "published" }
                  : kind === "index"
                    ? { registry: defaultRegistry() }
                    : kind === "duplicate"
                      ? { records: [] }
                      : kind === "score"
                        ? { policy: defaultPolicy() }
                        : kind === "ai"
                          ? {
                              mode: "openrouter",
                              instructions: DEFAULT_AI_INSTRUCTIONS,
                              outputSchema: "",
                            }
                          : {}),
  };
}
export function sourceChoices(node, input, nodes, fields) {
  const earlier = nodes.slice(
    0,
    nodes.findIndex((n) => n.id === node.id),
  );
  const fieldTypes = {
    file: ["file"],
    doi: ["text", "url"],
    url: ["url"],
    text: ["text", "textarea", "email", "select"],
    number: ["number", "integer"],
    date: ["date"],
    boolean: ["boolean"],
  };
  return [
    ...fields
      .filter((f) =>
        input.type === "ai_context"
          ? f.type !== "file"
          : (fieldTypes[input.type] || []).includes(f.type),
      )
      .map((f) => ({
        value: `field|${f.id}`,
        label: `Form: ${f.label}`,
        group: "Submission form",
      })),
    ...earlier.flatMap((n) =>
      nodeDefinition(n)
        .outputs.map((o) =>
          n.config?.tool === "use_form_value" && o.key === "value"
            ? {
                ...o,
                type:
                  fields.find((f) => f.id === n.config.settings?.fieldId)
                    ?.type || n.config.settings?.valueType,
              }
            : n.kind === "use_form_value" && o.key === "value"
              ? {
                  ...o,
                  type:
                    fields.find((f) => f.id === n.config.fieldId)?.type ||
                    n.config.valueType,
                }
              : o,
        )
        .filter((o) =>
          input.type === "ai_context"
            ? !["file", "submission"].includes(o.type)
            : o.type === input.type ||
              (input.type === "number" && o.type === "integer") ||
              (input.type === "text" &&
                ["textarea", "email", "url", "select"].includes(o.type)),
        )
        .map((o) => ({
          value: `node|${n.id}|${o.key}`,
          label: `${n.name} → ${o.label}`,
          group: "Earlier steps",
        })),
    ),
  ];
}
export function suggestMappings(node, nodes, fields) {
  const mappings = { ...node.mappings };
  for (const input of nodeDefinition(node).inputs) {
    const choices = sourceChoices(node, input, nodes, fields);
    const outputs = choices.filter((c) => c.value.startsWith("node|"));
    const named = choices.find(
      (c) =>
        c.value.startsWith("field|") &&
        (input.key === "faculty"
          ? /faculty|name/i
          : ["doi", "claimedDoi"].includes(input.key)
            ? /doi/i
            : input.key === "url"
              ? /url/i
              : /paper|pdf/i
        ).test(c.label),
    );
    if (input.key === "claimedDoi") {
      if (named) mappings[input.key] = named.value;
    } else if (outputs.length)
      mappings[input.key] = (
        input.type === "ai_context"
          ? outputs.find((c) => c.value.endsWith("|decision")) || outputs.at(-1)
          : outputs.at(-1)
      ).value;
    else if (named) mappings[input.key] = named.value;
    else if (choices.length === 1) mappings[input.key] = choices[0].value;
  }
  return { ...node, mappings };
}
export function exampleWorkflow(fields) {
  let nodes = tools.map((t) => createNode(t.kind));
  nodes = nodes.map((n, i) => ({
    ...n,
    routes: Object.fromEntries(
      definition(n.kind).routes.map((r) => [
        r,
        n.kind === "decision"
          ? nodes[r === "clear" ? 10 : r === "uncertain" ? 9 : 11].id
          : n.kind === "ai"
            ? nodes[11].id
            : nodes[i + 1]?.id || "",
      ]),
    ),
  }));
  nodes = nodes.map((n) => suggestMappings(n, nodes, fields));
  nodes.find((n) => n.kind === "period").config = {
    start: "2021-01-01",
    end: "2021-12-31",
    dateRule: "published",
  };
  return nodes;
}
