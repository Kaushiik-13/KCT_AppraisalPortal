import React, { useState } from "react";
import {
  newScoreComponent,
  newScoringRule,
  policySources,
  saveScoringVersion,
} from "./scoringPolicy";
import { PolicyEditor } from "./NodeSettings";

export default function ScoringStudio({
  policy,
  onChange,
  fields,
  nodes,
  setNodes,
}) {
  const [message, setMessage] = useState(""),
    sources = policySources(fields, nodes),
    draft = {
      mode: "rules",
      aggregation: "sum",
      components: [],
      ...policy.draft,
    };
  const edit = (patch) => {
    onChange({ ...policy, draft: { ...draft, ...patch } });
    setMessage("");
  };
  const rule = (id, patch) =>
    edit({
      rules: draft.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  const component = (id, patch) =>
    edit({
      components: draft.components.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    });
  const legacy = nodes.filter(
    (n) =>
      n.kind === "score" ||
      (["action", "plugin"].includes(n.kind) && n.config.tool === "score"),
  );
  return (
    <section className="scoring-studio studio">
      <div className="policy-intro">
        <h2>Scoring policy</h2>
        <p>
          Define what earns points before building the workflow. The workflow
          will map verified or AI-evaluated numeric outputs into this saved
          policy.
        </p>
        <label>
          Policy style
          <select
            value={draft.mode}
            onChange={(e) => {
              onChange({
                ...policy,
                enabled: e.target.value === "formula" ? false : policy.enabled,
                draft: { ...draft, mode: e.target.value },
              });
              setMessage("");
            }}
          >
            <option value="formula">Combine score components</option>
            <option value="rules">Conditional scoring rules</option>
          </select>
        </label>
        {draft.mode === "rules" ? (
          <label className="check-row">
            <input
              type="checkbox"
              checked={policy.enabled}
              onChange={(e) =>
                onChange({ ...policy, enabled: e.target.checked })
              }
            />
            Apply this rule policy automatically at workflow Results
          </label>
        ) : (
          <p>
            Formula policies are applied with an Apply scoring policy Action so
            you can manually connect each component to a workflow output.
          </p>
        )}
      </div>
      <div className="policy-layout">
        <div>
          <div className="policy-card">
            <h3>Draft policy</h3>
            <div className="two-columns">
              <label>
                Version name
                <input
                  value={draft.version}
                  onChange={(e) => edit({ version: e.target.value })}
                />
              </label>
              <label>
                Maximum points (optional)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={draft.maxPoints}
                  onChange={(e) => edit({ maxPoints: e.target.value })}
                  placeholder="No cap"
                />
              </label>
            </div>
            {draft.mode === "formula" ? (
              <FormulaEditor draft={draft} edit={edit} component={component} />
            ) : (
              <RulesEditor
                draft={draft}
                edit={edit}
                rule={rule}
                sources={sources}
              />
            )}
          </div>
          {legacy.length > 0 && (
            <details className="policy-card">
              <summary>Existing publication policies ({legacy.length})</summary>
              <p>
                These specialized policies remain compatible with the
                publication example.
              </p>
              {legacy.map((n) => (
                <div key={n.id}>
                  <h3>{n.name}</h3>
                  <PolicyEditor
                    policy={
                      n.kind === "score"
                        ? n.config.policy
                        : n.config.settings.policy
                    }
                    onChange={(updated) =>
                      setNodes(
                        nodes.map((x) =>
                          x.id !== n.id
                            ? x
                            : {
                                ...x,
                                config:
                                  x.kind === "score"
                                    ? { ...x.config, policy: updated }
                                    : {
                                        ...x.config,
                                        settings: {
                                          ...x.config.settings,
                                          policy: updated,
                                        },
                                      },
                              },
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </details>
          )}
        </div>
        <aside className="policy-card policy-versions">
          <h3>Saved policy versions</h3>
          <p>
            Save the policy before mapping it in Workflow. Saved versions cannot
            be overwritten.
          </p>
          <button
            className="btn primary"
            onClick={() => {
              try {
                onChange(
                  saveScoringVersion({ ...policy, draft }, fields, nodes),
                );
                setMessage(
                  "Version saved and selected. You can now map it in Workflow.",
                );
              } catch (e) {
                setMessage(e.message);
              }
            }}
          >
            Save policy version
          </button>
          {message && <p role="status">{message}</p>}
          <label>
            Selected version
            <select
              value={policy.activeVersion}
              onChange={(e) =>
                onChange({ ...policy, activeVersion: e.target.value })
              }
            >
              <option value="">No version selected</option>
              {policy.versions.map((v) => (
                <option key={v.version}>{v.version}</option>
              ))}
            </select>
          </label>
          {policy.versions.map((v) => (
            <details key={v.version}>
              <summary>
                {v.version} ·{" "}
                {(v.mode || "rules") === "formula"
                  ? `${(v.components || []).length} components`
                  : `${v.rules.length} rules`}
              </summary>
              {(v.mode || "rules") === "formula" ? (
                <ul>
                  {v.components.map((c) => (
                    <li key={c.id}>
                      {c.name} · weight {c.weight}
                      {c.required ? " · required" : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul>
                  {v.rules.map((r) => (
                    <li key={r.id}>
                      {r.name}: {r.points} × {r.multiplier}
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="mini"
                onClick={() =>
                  edit({ ...structuredClone(v), version: `${v.version}-copy` })
                }
              >
                Copy to draft
              </button>
            </details>
          ))}
          <small>
            Policies, mappings and versions are organization-defined
            configuration. Test submissions and results remain session-only.
          </small>
        </aside>
      </div>
    </section>
  );
}

function FormulaEditor({ draft, edit, component }) {
  return (
    <>
      <h3>Score components</h3>
      <p>
        Create one component for every numeric result the workflow must supply.
        Components are generic: they can represent document relevance, quality,
        impact, completion, compliance, or any organization-defined measure.
      </p>
      <label>
        Combination method
        <select
          value={draft.aggregation}
          onChange={(e) => edit({ aggregation: e.target.value })}
        >
          <option value="sum">Weighted sum</option>
          <option value="average">Simple average</option>
          <option value="weighted_average">Weighted average</option>
        </select>
      </label>
      {!draft.components.length && (
        <p>Add components now; connect their values later in the workflow.</p>
      )}
      {draft.components.map((c, i) => (
        <fieldset className="policy-rule" key={c.id}>
          <legend>Component {i + 1}</legend>
          <div className="three-columns">
            <label>
              Name
              <input
                value={c.name}
                onChange={(e) => component(c.id, { name: e.target.value })}
                placeholder="e.g. Evidence relevance"
              />
            </label>
            <label>
              Weight
              <input
                type="number"
                min="0"
                step="any"
                value={c.weight}
                onChange={(e) => component(c.id, { weight: e.target.value })}
              />
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={c.required}
                onChange={(e) =>
                  component(c.id, { required: e.target.checked })
                }
              />
              Required
            </label>
          </div>
          <button
            className="mini danger"
            onClick={() =>
              edit({
                components: draft.components.filter((x) => x.id !== c.id),
              })
            }
          >
            Remove component
          </button>
        </fieldset>
      ))}
      <button
        className="btn"
        onClick={() =>
          edit({ components: [...draft.components, newScoreComponent()] })
        }
      >
        + Add score component
      </button>
      <p>
        <strong>Weighted sum:</strong> value × weight, then add.{" "}
        <strong>Simple average:</strong> average available values.{" "}
        <strong>Weighted average:</strong> divide weighted total by available
        weight.
      </p>
    </>
  );
}

function RulesEditor({ draft, edit, rule, sources }) {
  return (
    <>
      <h3>Conditional rules</h3>
      {!draft.rules.length && (
        <p>Add a rule, choose the information to check, and set its marks.</p>
      )}
      {draft.rules.map((r, i) => (
        <fieldset className="policy-rule" key={r.id}>
          <legend>Rule {i + 1}</legend>
          <label>
            Rule name
            <input
              value={r.name}
              onChange={(e) => rule(r.id, { name: e.target.value })}
            />
          </label>
          <label>
            When
            <select
              value={r.match}
              onChange={(e) => rule(r.id, { match: e.target.value })}
            >
              <option value="all">All conditions match</option>
              <option value="any">Any condition matches</option>
            </select>
          </label>
          {r.conditions.map((c, j) => {
            const change = (patch) =>
              rule(r.id, {
                conditions: r.conditions.map((x, k) =>
                  k === j ? { ...x, ...patch } : x,
                ),
              });
            return (
              <div className="policy-condition" key={j}>
                <label>
                  Information
                  <select
                    value={c.source}
                    onChange={(e) => {
                      const source = sources.find(
                        (s) => s.value === e.target.value,
                      );
                      change({
                        source: e.target.value,
                        type: source?.type || "text",
                        operator: "eq",
                        expected: "",
                      });
                    }}
                  >
                    <option value="">Choose information</option>
                    {sources.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {!sources.some(
                    (s) => s.value === c.source && s.type === c.type,
                  ) && (
                    <small className="error">
                      Select a compatible source again after building the
                      workflow.
                    </small>
                  )}
                </label>
                <label>
                  Comparison
                  <select
                    value={c.operator}
                    onChange={(e) => change({ operator: e.target.value })}
                  >
                    <option value="eq">Equals</option>
                    <option value="ne">Does not equal</option>
                    {["date", "number"].includes(c.type) && (
                      <>
                        <option value="gte">At least / on or after</option>
                        <option value="lte">At most / on or before</option>
                      </>
                    )}
                  </select>
                </label>
                <label>
                  Value
                  {c.type === "boolean" ? (
                    <select
                      value={c.expected}
                      onChange={(e) => change({ expected: e.target.value })}
                    >
                      <option value="">Choose</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type={
                        ["number", "date"].includes(c.type) ? c.type : "text"
                      }
                      value={c.expected}
                      onChange={(e) => change({ expected: e.target.value })}
                    />
                  )}
                </label>
                <button
                  className="mini"
                  onClick={() =>
                    rule(r.id, {
                      conditions: r.conditions.filter((_, k) => k !== j),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            );
          })}
          <button
            className="mini"
            onClick={() =>
              rule(r.id, {
                conditions: [
                  ...r.conditions,
                  {
                    source: "result|outcome",
                    type: "text",
                    operator: "eq",
                    expected: "",
                  },
                ],
              })
            }
          >
            + Condition
          </button>
          <div className="three-columns">
            <label>
              Points
              <input
                type="number"
                min="0"
                step="any"
                value={r.points}
                onChange={(e) => rule(r.id, { points: e.target.value })}
              />
            </label>
            <label>
              Multiplier
              <input
                type="number"
                min="0"
                step="any"
                value={r.multiplier}
                onChange={(e) => rule(r.id, { multiplier: e.target.value })}
              />
            </label>
            <label>
              Scoring outcome
              <input
                value={r.outcome}
                onChange={(e) => rule(r.id, { outcome: e.target.value })}
              />
            </label>
          </div>
          <div className="button-row">
            <button
              className="mini"
              disabled={!i}
              onClick={() => {
                const rules = [...draft.rules];
                [rules[i - 1], rules[i]] = [rules[i], rules[i - 1]];
                edit({ rules });
              }}
            >
              Move up
            </button>
            <button
              className="mini danger"
              onClick={() =>
                edit({ rules: draft.rules.filter((x) => x.id !== r.id) })
              }
            >
              Remove rule
            </button>
          </div>
        </fieldset>
      ))}
      <button
        className="btn"
        onClick={() => edit({ rules: [...draft.rules, newScoringRule()] })}
      >
        + Add rule
      </button>
      <label>
        If no rule matches
        <select
          value={draft.fallback}
          onChange={(e) => edit({ fallback: e.target.value })}
        >
          <option value="pending">Pending / insufficient evidence</option>
          <option value="zero">Award zero points</option>
        </select>
      </label>
      <small>
        Missing evidence stays pending and never silently becomes zero.
      </small>
    </>
  );
}
