const port = (key, label, type, options = {}) => ({
  key,
  label,
  type,
  ...options,
});
export const reusableTools = [
  {
    kind: "use_form_value",
    name: "Use form value",
    description:
      "Pass one existing submission field to later steps. Its type comes from the form definition.",
    inputs: [],
    outputs: [port("value", "Form value", "form_value")],
    routes: ["next"],
  },
  {
    kind: "extract_evidence",
    name: "Extract evidence",
    description:
      "Extract selected fields, full content, or both from PDF, PPTX, XLS or XLSX evidence.",
    inputs: [port("file", "Evidence file", "file")],
    outputs: [],
    routes: ["next"],
  },
  {
    kind: "compare_evidence",
    name: "Compare evidence",
    description:
      "Compare one or more submitted or earlier values and return match, mismatch or unknown for each pair.",
    inputs: [],
    outputs: [
      port("comparison", "Comparison findings", "comparison"),
      port("status", "Overall status", "text"),
    ],
    routes: ["next"],
  },
  {
    kind: "date_range",
    name: "Check date range",
    description: "Check a date against inclusive start and end dates.",
    inputs: [port("date", "Date to check", "date")],
    outputs: [
      port("finding", "Date finding", "finding"),
      port("eligible", "Within range", "boolean"),
      port("status", "Status", "text"),
    ],
    routes: ["next"],
  },
  {
    kind: "find_duplicates",
    name: "Find duplicates",
    description:
      "Compare a selected identifier and owner against configured test records.",
    inputs: [
      port("key", "Record identifier", "text"),
      port("owner", "Owner / person identifier", "text"),
    ],
    outputs: [
      port("finding", "Duplicate finding", "finding"),
      port("duplicate", "Duplicate candidate", "boolean"),
      port("status", "Status", "text"),
    ],
    routes: ["next"],
  },
  {
    kind: "apply_policy",
    name: "Apply scoring policy",
    description: "Calculate provisional marks using a saved policy version.",
    inputs: [],
    outputs: [
      port("scoring", "Policy calculation", "finding"),
      port("points", "Provisional points", "number"),
      port("status", "Scoring status", "text"),
    ],
    routes: ["next"],
  },
];
export const legacyReusableTools = [
  {
    kind: "document_extract",
    name: "Extract evidence (legacy PDF)",
    description: "Legacy PDF extraction step.",
    inputs: [port("file", "Document PDF", "file")],
    outputs: [],
    routes: ["next"],
  },
  {
    kind: "compare_values",
    name: "Compare evidence (legacy pair)",
    description: "Legacy single-pair comparison step.",
    inputs: [],
    outputs: [
      port("finding", "Comparison details", "finding"),
      port("matches", "Matches", "boolean"),
      port("status", "Status", "text"),
    ],
    routes: ["next"],
  },
  {
    kind: "external_lookup",
    name: "External lookup (legacy)",
    description:
      "Legacy public JSON lookup. New workflows should use a future connector instead.",
    inputs: [port("query", "Lookup value", "text")],
    outputs: [],
    routes: ["next"],
  },
];
export const newOutputField = () => ({
  id: crypto.randomUUID(),
  name: "New field",
  type: "text",
  label: "",
});
export const newComparison = () => ({
  id: crypto.randomUUID(),
  name: "New comparison",
  valueType: "text",
  operator: "equals",
  ignoreCase: true,
});
export function reusableDefaults(kind) {
  return {
    use_form_value: { fieldId: "", valueType: "text" },
    extract_evidence: { mode: "fields", fields: [] },
    compare_evidence: { comparisons: [newComparison()] },
    document_extract: { fields: [] },
    compare_values: { valueType: "text", operator: "eq", ignoreCase: true },
    date_range: { start: "", end: "" },
    find_duplicates: { records: [], ignoreCase: true },
    external_lookup: { endpoint: "", fields: [] },
    apply_policy: { policyVersion: "", components: [] },
  }[kind];
}
export function reusableDefinition(node) {
  if (node.kind === "use_form_value")
    return {
      outputs: [
        port("value", "Form value", node.config.valueType || "text"),
        port("source", "Source details", "document"),
      ],
    };
  if (node.kind === "extract_evidence")
    return {
      outputs: [
        port("evidence", "Evidence package", "document"),
        port("content", "Full content", "document"),
        port("status", "Extraction status", "text"),
        ...(node.config.fields || []).map((f) => port(f.id, f.name, f.type)),
      ],
    };
  if (node.kind === "compare_evidence")
    return {
      inputs: (node.config.comparisons || []).flatMap((c) => [
        port(`left_${c.id}`, `${c.name}: submitted / left`, c.valueType),
        port(`right_${c.id}`, `${c.name}: extracted / right`, c.valueType),
      ]),
      outputs: [
        port("comparison", "Comparison findings", "comparison"),
        port("status", "Overall status", "text"),
      ],
    };
  if (node.kind === "apply_policy")
    return {
      inputs: (node.config.components || []).map((component) =>
        port(component.id, component.name, "number", {
          optional: !component.required,
        }),
      ),
    };
  if (["document_extract", "external_lookup"].includes(node.kind))
    return {
      outputs: [
        port("finding", "Findings and source evidence", "finding"),
        ...(node.kind === "document_extract"
          ? [
              port("fullText", "Full document text", "text"),
              port("textByPage", "Text by page", "document"),
            ]
          : []),
        ...(node.config.fields || []).map((f) => port(f.id, f.name, f.type)),
      ],
    };
  if (node.kind === "ai") {
    let properties = {};
    try {
      properties = JSON.parse(node.config.outputSchema || "{}").properties || {};
    } catch {}
    const schemaType = (type) =>
      ({ string: "text", number: "number", integer: "number", boolean: "boolean" })[type] || "ai_context";
    return {
      inputs: [
        port("decision", "Primary input", "ai_context"),
        ...(node.config.contextInputs || []).map((f) =>
          port(f.id, f.name || "Additional input", "ai_context"),
        ),
      ],
      outputs: [
        port("assistance", "AI evaluation and details", "assistance"),
        port("response", "Response text", "text"),
        ...Object.entries(properties).map(([key, rule]) =>
          port(key, `Structured: ${key}`, schemaType(rule.type)),
        ),
      ],
    };
  }
  if (node.kind === "compare_values")
    return {
      inputs: [
        port("left", "First value", node.config.valueType),
        port("right", "Second value", node.config.valueType),
      ],
    };
  return {};
}
export function parseValue(value, type) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim())
  )
    return null;
  if (type === "text")
    return typeof value === "string" ? value.trim() : String(value);
  if (type === "number")
    return ["string", "number"].includes(typeof value) &&
      Number.isFinite(Number(value))
      ? Number(value)
      : null;
  if (type === "boolean")
    return [true, "true", "Yes", "yes"].includes(value)
      ? true
      : [false, "false", "No", "no"].includes(value)
        ? false
        : null;
  if (type === "date")
    return typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value
      ? value
      : null;
  if (type === "file")
    return Array.isArray(value) && value.length ? value : null;
  return value;
}
export function reusableIssues(node) {
  const c = node.config,
    errors = [];
  if (node.kind === "use_form_value" && !c.fieldId)
    errors.push("Choose a form field.");
  if (
    ["extract_evidence", "document_extract", "external_lookup"].includes(
      node.kind,
    )
  ) {
    if (node.kind === "external_lookup" && !c.fields?.length)
      errors.push("Add at least one output field.");
    if (
      (c.fields || []).some(
        (f) =>
          !f.name.trim() ||
          !f.label.trim() ||
          !["text", "number", "date", "boolean"].includes(f.type),
      )
    )
      errors.push("Give every extracted field a name, type and source label.");
  }
  if (
    node.kind === "extract_evidence" &&
    !["fields", "content", "both"].includes(c.mode)
  )
    errors.push("Choose a valid extraction mode.");
  if (
    node.kind === "extract_evidence" &&
    ["fields", "both"].includes(c.mode) &&
    !c.fields?.length
  )
    errors.push("Add at least one field, or choose Full content mode.");
  if (node.kind === "compare_evidence") {
    if (!c.comparisons?.length) errors.push("Add at least one comparison.");
    if (
      c.comparisons?.some(
        (x) =>
          !x.name?.trim() ||
          !["text", "number", "date", "boolean"].includes(x.valueType) ||
          !["equals", "not_equals", "contains", "gte", "lte"].includes(
            x.operator,
          ),
      )
    )
      errors.push(
        "Complete every comparison with a name, type and compatible operator.",
      );
  }
  if (node.kind === "external_lookup") {
    try {
      const u = new URL(c.endpoint);
      if (
        u.protocol !== "https:" ||
        u.username ||
        u.password ||
        !c.endpoint.includes("{value}")
      )
        throw Error();
    } catch {
      errors.push(
        "Enter an HTTPS API URL containing {value}, without credentials.",
      );
    }
  }
  if (
    node.kind === "date_range" &&
    (!parseValue(c.start, "date") ||
      !parseValue(c.end, "date") ||
      c.start > c.end)
  )
    errors.push("Enter a valid start and end date.");
  if (
    node.kind === "find_duplicates" &&
    (c.records || []).some((r) => !r.key?.trim() || !r.owner?.trim())
  )
    errors.push("Complete each record identifier and owner.");
  if (
    node.kind === "compare_values" &&
    ![
      "eq",
      "ne",
      ...(["number", "date"].includes(c.valueType) ? ["gte", "lte"] : []),
    ].includes(c.operator)
  )
    errors.push("Choose a compatible comparison.");
  if (node.kind === "apply_policy" && !c.policyVersion)
    errors.push("Select a saved scoring policy version.");
  return errors;
}
const normalized = (v, fold) =>
  fold && typeof v === "string" ? v.trim().toLowerCase() : v;
const candidateFor = (sections, field) => {
  const candidates = [];
  const label = field.label.trim().toLowerCase();
  for (const section of sections)
    for (const line of String(section.text || "").split("\n")) {
      const separator = line.indexOf(":");
      if (
        separator >= 0 &&
        line.slice(0, separator).trim().toLowerCase() === label
      )
        candidates.push({
          raw: line.slice(separator + 1).trim(),
          location: section.location,
          excerpt: line,
        });
    }
  return candidates;
};
const compare = (left, right, c) => {
  left = parseValue(left, c.valueType);
  right = parseValue(right, c.valueType);
  if (left === null || right === null)
    return {
      status: "unknown",
      submitted: left,
      extracted: right,
      confidence: 0,
      requiresReview: true,
    };
  const a = normalized(left, c.ignoreCase),
    b = normalized(right, c.ignoreCase);
  const matches =
    c.operator === "equals"
      ? a === b
      : c.operator === "not_equals"
        ? a !== b
        : c.operator === "contains"
          ? String(b).includes(String(a))
          : c.operator === "gte"
            ? a >= b
            : a <= b;
  return {
    status: matches ? "match" : "mismatch",
    submitted: left,
    extracted: right,
    confidence: 1,
    requiresReview: !matches,
  };
};
export async function executeReusable(node, input, ctx) {
  const c = node.config;
  if (node.kind === "use_form_value") {
    const field = ctx.fields.find((f) => f.id === c.fieldId);
    if (!field) throw Error("The selected form field no longer exists.");
    return {
      value: ctx.values[field.id] ?? null,
      source: {
        origin: "submission_form",
        fieldId: field.id,
        type: field.type,
        label: field.label,
      },
    };
  }
  if (node.kind === "compare_evidence") {
    const results = c.comparisons.map((item) => ({
      id: item.id,
      name: item.name,
      ...compare(input[`left_${item.id}`], input[`right_${item.id}`], item),
    }));
    const status = results.some((r) => r.status === "mismatch")
      ? "mismatch"
      : results.some((r) => r.status === "unknown")
        ? "unknown"
        : "match";
    return {
      comparison: { status, results, requiresReview: status !== "match" },
      status,
    };
  }
  if (node.kind === "extract_evidence") {
    if (!Array.isArray(input.file) || input.file.length !== 1)
      throw Error("Choose exactly one PDF, PPTX, XLS or XLSX evidence file.");
    const document = await ctx.extract(input.file[0]);
    const sections = document.sections || [];
    const warnings = [...(document.warnings || [])];
    const fields = {},
      evidence = [];
    if (c.mode !== "content")
      for (const field of c.fields) {
        const candidates = candidateFor(sections, field);
        const distinct = [...new Set(candidates.map((x) => x.raw))];
        const value =
          distinct.length === 1 ? parseValue(distinct[0], field.type) : null;
        fields[field.id] = value;
        evidence.push({
          field: field.id,
          label: field.name,
          value,
          status: value === null ? "unknown" : "candidate",
          confidence: value === null ? 0 : 0.9,
          verified: false,
          locations: candidates.map((x) => x.location),
          excerpts: candidates.map((x) => x.excerpt),
        });
        if (!candidates.length) warnings.push(`${field.name} was not found.`);
        else if (distinct.length > 1)
          warnings.push(`${field.name} has conflicting candidates.`);
      }
    const includeContent = c.mode !== "fields";
    const content = includeContent
      ? {
          fullText: sections
            .map((s) => `[${s.title}]\n${s.text || "[No extractable text]"}`)
            .join("\n\n"),
          sections,
        }
      : null;
    const status = warnings.length ? "candidate_with_warnings" : "candidate";
    return {
      evidence: {
        status,
        format: document.format,
        fileName: document.fileName,
        fields,
        evidence,
        content,
        warnings,
        verified: false,
      },
      content,
      status,
      ...fields,
    };
  }
  if (node.kind === "compare_values") {
    let left = parseValue(input.left, c.valueType),
      right = parseValue(input.right, c.valueType);
    if (c.valueType === "text" && left !== null && right !== null) {
      left = normalized(left, c.ignoreCase);
      right = normalized(right, c.ignoreCase);
    }
    const matches =
      left === null || right === null
        ? null
        : c.operator === "eq"
          ? left === right
          : c.operator === "ne"
            ? left !== right
            : c.operator === "gte"
              ? left >= right
              : left <= right;
    const status =
      matches === null ? "uncertain" : matches ? "matched" : "different";
    return {
      finding: { status, left, right, operator: c.operator },
      matches,
      status,
    };
  }
  if (node.kind === "date_range") {
    const date = parseValue(input.date, "date");
    const eligible = date === null ? null : date >= c.start && date <= c.end;
    const status =
      eligible === null ? "uncertain" : eligible ? "eligible" : "ineligible";
    return {
      finding: { status, date, start: c.start, end: c.end },
      eligible,
      status,
    };
  }
  if (node.kind === "find_duplicates") {
    const key = parseValue(input.key, "text"),
      owner = parseValue(input.owner, "text");
    const records =
      key === null || owner === null
        ? null
        : c.records.filter(
            (r) =>
              normalized(r.key, c.ignoreCase) ===
                normalized(key, c.ignoreCase) &&
              normalized(r.owner, c.ignoreCase) ===
                normalized(owner, c.ignoreCase),
          );
    const duplicate = records === null ? null : records.length > 0;
    const status =
      duplicate === null ? "uncertain" : duplicate ? "candidate" : "clear";
    return {
      finding: {
        status,
        matches: records,
        scope:
          "Configured test records only; not a complete organizational history.",
      },
      duplicate,
      status,
    };
  }
  if (node.kind === "document_extract") {
    if (!Array.isArray(input.file) || input.file.length !== 1)
      throw Error("Choose exactly one PDF for document extraction.");
    const document = await ctx.extract(input.file[0]);
    const pages = document.pages || document.paper?.pages || [];
    const result = {},
      findings = [];
    const unreadablePages = pages
      .filter((p) => !p.text?.trim())
      .map((p) => p.number);
    const readable = pages.some((p) => p.text?.trim());
    const note = readable
      ? `Extracted PDF text, not verified facts. ${
          unreadablePages.length
            ? `Pages ${unreadablePages.join(", ")} have no extractable text; their content has NOT been evaluated.`
            : "All pages contain extractable text; images, diagrams and reading order may still need manual review."
        }`
      : "No extractable text. OCR is not available.";
    const fullText = readable
      ? [
          note,
          ...pages.map(
            (p) => `[Page ${p.number}]\n${p.text || "[No extractable text]"}`,
          ),
        ].join("\n\n")
      : null;
    for (const f of c.fields) {
      const candidates = candidateFor(
        pages.map((p) => ({
          text: p.text,
          location: { type: "pdf_page", page: p.number },
        })),
        f,
      );
      const distinct = [...new Set(candidates.map((x) => x.raw))];
      const value =
        distinct.length === 1 ? parseValue(distinct[0], f.type) : null;
      result[f.id] = value;
      findings.push({
        name: f.name,
        value,
        status: value === null ? "uncertain" : "candidate",
        evidence: candidates.map((x) => ({
          page: x.location.page,
          excerpt: x.excerpt,
        })),
      });
    }
    return {
      finding: {
        status:
          !readable ||
          unreadablePages.length ||
          findings.some((f) => f.value === null)
            ? "uncertain"
            : "candidate",
        findings,
        note,
        pages: pages.map((p) => ({ page: p.number, text: p.text || "" })),
        pageCount: pages.length,
        unreadablePages,
        characterCount: fullText?.length || 0,
      },
      fullText,
      textByPage: readable ? { note, pages } : null,
      ...result,
    };
  }
  if (node.kind === "external_lookup") {
    const unknown = (reason) => ({
      finding: { status: "unknown", reason },
      ...Object.fromEntries(c.fields.map((f) => [f.id, null])),
    });
    if (!parseValue(input.query, "text"))
      return unknown("Lookup value is missing.");
    const source = c.endpoint.replaceAll(
      "{value}",
      encodeURIComponent(input.query),
    );
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await (ctx.fetcher || fetch)(source, {
        signal: controller.signal,
        credentials: "omit",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return unknown(`API returned HTTP ${response.status}.`);
      const text = await response.text();
      if (text.length > 1000000)
        return unknown("API response exceeds the 1 MB limit.");
      const data = JSON.parse(text),
        result = {};
      for (const f of c.fields) {
        const raw = f.label
          .split(".")
          .reduce(
            (v, k) => (v && Object.hasOwn(v, k) ? v[k] : undefined),
            data,
          );
        result[f.id] = parseValue(raw, f.type);
      }
      return {
        finding: {
          status: Object.values(result).some((v) => v === null)
            ? "unknown"
            : "found",
          source,
          values: result,
          retrievedAt: new Date().toISOString(),
        },
        ...result,
      };
    } catch {
      return unknown("API could not return JSON.");
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}
