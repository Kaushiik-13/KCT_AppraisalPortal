import React from "react";
import { newOutputField, newComparison } from "./reusableTools";
export default function ReusableSettings({
  node,
  onChange,
  policy,
  fields = [],
}) {
  const c = node.config,
    patch = (p) => onChange({ ...node, config: { ...c, ...p } });
  return (
    <>
      {node.kind === "use_form_value" && (
        <>
          <label>
            Form field
            <select
              value={c.fieldId}
              onChange={(e) => {
                const field = fields.find((f) => f.id === e.target.value);
                patch({
                  fieldId: e.target.value,
                  valueType:
                    field?.type === "integer"
                      ? "number"
                      : field?.type === "textarea"
                        ? "text"
                        : field?.type || "text",
                });
              }}
            >
              <option value="">Choose an existing field</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} · {f.type}
                </option>
              ))}
            </select>
            <small>
              The output type follows the selected form field automatically.
              This step maps a value; it does not read or verify a file.
            </small>
          </label>
        </>
      )}
      {node.kind === "extract_evidence" && (
        <>
          <label>
            Extraction mode
            <select
              value={c.mode}
              onChange={(e) => patch({ mode: e.target.value })}
            >
              <option value="fields">Selected fields</option>
              <option value="content">Full content</option>
              <option value="both">Fields and full content</option>
            </select>
          </label>
          <p>
            Supports PDF, PPTX, XLS and XLSX. Extracted values are candidates,
            never verified facts. Page, slide, sheet and range locations are
            preserved.
          </p>
          {c.mode !== "content" && (
            <>
              <h3>Fields to extract</h3>
              <p>Enter the printed label before a colon, such as “DOI: 10…”.</p>
              {c.fields.map((f, i) => (
                <fieldset key={f.id}>
                  <legend>Field {i + 1}</legend>
                  <label>
                    Output name
                    <input
                      value={f.name}
                      onChange={(e) =>
                        patch({
                          fields: c.fields.map((x) =>
                            x.id === f.id ? { ...x, name: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Printed label
                    <input
                      value={f.label}
                      onChange={(e) =>
                        patch({
                          fields: c.fields.map((x) =>
                            x.id === f.id ? { ...x, label: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Data type
                    <select
                      value={f.type}
                      onChange={(e) =>
                        patch({
                          fields: c.fields.map((x) =>
                            x.id === f.id ? { ...x, type: e.target.value } : x,
                          ),
                        })
                      }
                    >
                      {["text", "number", "date", "boolean"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="mini danger"
                    onClick={() =>
                      patch({ fields: c.fields.filter((x) => x.id !== f.id) })
                    }
                  >
                    Remove field
                  </button>
                </fieldset>
              ))}
              <button
                className="btn"
                onClick={() =>
                  patch({ fields: [...c.fields, newOutputField()] })
                }
              >
                Add extracted field
              </button>
            </>
          )}
        </>
      )}
      {node.kind === "compare_evidence" && (
        <>
          <p>
            Each pair returns match, mismatch or unknown. Missing evidence is
            unknown, not a mismatch.
          </p>
          {c.comparisons.map((item, i) => {
            const update = (p) =>
              patch({
                comparisons: c.comparisons.map((x) =>
                  x.id === item.id ? { ...x, ...p } : x,
                ),
              });
            return (
              <fieldset key={item.id}>
                <legend>Comparison {i + 1}</legend>
                <label>
                  Name
                  <input
                    value={item.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </label>
                <label>
                  Data type
                  <select
                    value={item.valueType}
                    onChange={(e) =>
                      onChange({
                        ...node,
                        mappings: Object.fromEntries(
                          Object.entries(node.mappings).filter(
                            ([key]) => !key.endsWith(item.id),
                          ),
                        ),
                        config: {
                          ...c,
                          comparisons: c.comparisons.map((x) =>
                            x.id === item.id
                              ? {
                                  ...x,
                                  valueType: e.target.value,
                                  operator: "equals",
                                }
                              : x,
                          ),
                        },
                      })
                    }
                  >
                    {["text", "number", "date", "boolean"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Comparison
                  <select
                    value={item.operator}
                    onChange={(e) => update({ operator: e.target.value })}
                  >
                    <option value="equals">Equals</option>
                    <option value="not_equals">Does not equal</option>
                    {item.valueType === "text" && (
                      <option value="contains">
                        Extracted value contains submitted value
                      </option>
                    )}
                    {["number", "date"].includes(item.valueType) && (
                      <>
                        <option value="gte">
                          Submitted is at least / on or after extracted
                        </option>
                        <option value="lte">
                          Submitted is at most / on or before extracted
                        </option>
                      </>
                    )}
                  </select>
                </label>
                {item.valueType === "text" && (
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={item.ignoreCase}
                      onChange={(e) => update({ ignoreCase: e.target.checked })}
                    />
                    Ignore letter case
                  </label>
                )}
                <button
                  className="mini danger"
                  onClick={() => {
                    const mappings = { ...node.mappings };
                    delete mappings[`left_${item.id}`];
                    delete mappings[`right_${item.id}`];
                    onChange({
                      ...node,
                      mappings,
                      config: {
                        ...c,
                        comparisons: c.comparisons.filter(
                          (x) => x.id !== item.id,
                        ),
                      },
                    });
                  }}
                >
                  Remove comparison
                </button>
              </fieldset>
            );
          })}
          <button
            className="btn"
            onClick={() =>
              patch({ comparisons: [...c.comparisons, newComparison()] })
            }
          >
            Add comparison
          </button>
        </>
      )}
      {["document_extract", "external_lookup"].includes(node.kind) && (
        <>
          {node.kind === "external_lookup" ? (
            <label>
              Public JSON API URL
              <input
                placeholder="https://example.org/records/{value}"
                value={c.endpoint}
                onChange={(e) => patch({ endpoint: e.target.value })}
              />
              <small>
                GET request from your browser. Use {"{value}"} for the encoded
                lookup input. Requires CORS support. Do not put keys or
                credentials here.
              </small>
            </label>
          ) : (
            <p>
              Full document text and Text by page are extracted automatically.
              Connect Full document text to AI to evaluate the content. Scanned
              pages need OCR, which is not included.
            </p>
          )}
          <h3>
            {node.kind === "document_extract"
              ? "Optional labelled fields"
              : "Fields to extract"}
          </h3>
          {node.kind === "document_extract" && (
            <p>
              Only add these for lines such as “Participant: Alex”. Leave empty
              when evaluating the whole document.
            </p>
          )}
          {c.fields.map((f, i) => (
            <fieldset key={f.id}>
              <legend>Field {i + 1}</legend>
              {["name", "label"].map((key) => (
                <label key={key}>
                  {key === "name"
                    ? "Output name"
                    : node.kind === "document_extract"
                      ? "Printed label before colon"
                      : "JSON path (e.g. record.name)"}
                  <input
                    value={f[key]}
                    onChange={(e) =>
                      patch({
                        fields: c.fields.map((x) =>
                          x.id === f.id ? { ...x, [key]: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <label>
                Data type
                <select
                  value={f.type}
                  onChange={(e) =>
                    patch({
                      fields: c.fields.map((x) =>
                        x.id === f.id ? { ...x, type: e.target.value } : x,
                      ),
                    })
                  }
                >
                  {["text", "number", "date", "boolean"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <button
                className="mini danger"
                onClick={() =>
                  patch({ fields: c.fields.filter((x) => x.id !== f.id) })
                }
              >
                Remove field
              </button>
            </fieldset>
          ))}
          <button
            className="btn"
            onClick={() => patch({ fields: [...c.fields, newOutputField()] })}
          >
            Add output field
          </button>
        </>
      )}
      {node.kind === "compare_values" && (
        <>
          <label>
            Data type
            <select
              value={c.valueType}
              onChange={(e) =>
                onChange({
                  ...node,
                  mappings: {},
                  config: { ...c, valueType: e.target.value, operator: "eq" },
                })
              }
            >
              {["text", "number", "date", "boolean"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Comparison
            <select
              value={c.operator}
              onChange={(e) => patch({ operator: e.target.value })}
            >
              <option value="eq">Equals</option>
              <option value="ne">Does not equal</option>
              {["number", "date"].includes(c.valueType) && (
                <>
                  <option value="gte">At least / on or after</option>
                  <option value="lte">At most / on or before</option>
                </>
              )}
            </select>
          </label>
          {c.valueType === "text" && (
            <label>
              <input
                type="checkbox"
                checked={c.ignoreCase}
                onChange={(e) => patch({ ignoreCase: e.target.checked })}
              />
              Ignore letter case
            </label>
          )}
        </>
      )}
      {node.kind === "date_range" && (
        <>
          {["start", "end"].map((key) => (
            <label key={key}>
              {key === "start" ? "Start date" : "End date"}
              <input
                type="date"
                value={c[key]}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
            </label>
          ))}
          <p>Both boundary dates are included. Missing dates stay uncertain.</p>
        </>
      )}
      {node.kind === "find_duplicates" && (
        <>
          <p>
            Compare the two mapped fields against these test records. An empty
            registry means no matches in this registry only.
          </p>
          {c.records.map((r, i) => (
            <fieldset key={i}>
              {["key", "owner"].map((key) => (
                <label key={key}>
                  {key === "key"
                    ? "Record identifier"
                    : "Owner / person identifier"}
                  <input
                    value={r[key]}
                    onChange={(e) =>
                      patch({
                        records: c.records.map((x, j) =>
                          i === j ? { ...x, [key]: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <button
                className="mini"
                onClick={() =>
                  patch({ records: c.records.filter((_, j) => i !== j) })
                }
              >
                Remove record
              </button>
            </fieldset>
          ))}
          <button
            className="btn"
            onClick={() =>
              patch({ records: [...c.records, { key: "", owner: "" }] })
            }
          >
            Add test record
          </button>
        </>
      )}
      {node.kind === "apply_policy" && (
        <label>
          Saved policy version
          <select
            value={c.policyVersion}
            onChange={(e) => {
              const version = (policy?.versions || []).find(
                (item) => item.version === e.target.value,
              );
              onChange({
                ...node,
                mappings: {},
                config: {
                  ...c,
                  policyVersion: e.target.value,
                  components:
                    (version?.mode || "rules") === "formula"
                      ? structuredClone(version.components || [])
                      : [],
                },
              });
            }}
          >
            <option value="">Choose a saved version</option>
            {(policy?.versions || []).map((v) => (
              <option key={v.version}>{v.version}</option>
            ))}
          </select>
          <small>
            Create and save a version in Scoring policy first. This step can use
            formula components are mapped above to numeric outputs from earlier
            workflow steps. Conditional rules can use input fields and earlier
            outputs; final-outcome rules need a Result instead.
          </small>
        </label>
      )}
    </>
  );
}
