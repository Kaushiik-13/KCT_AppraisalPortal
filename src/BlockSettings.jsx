import PluginPicker from "./PluginPicker";
import React, { useState } from "react";
import {
  actionTools,
  reusableActionTools,
  publicationTools,
  createNode,
  chooseActionTool,
  nodeDefinition,
  sourceChoices,
  valueTypes,
  suggestMappings,
} from "./workflowModel";
import NodeSettings from "./NodeSettings";

export default function BlockSettings({
  node,
  nodes,
  fields,
  onChange,
  onRemove,
  policy,
}) {
  const [picker, setPicker] = useState(false);
  const config = (patch) =>
    onChange({ ...node, config: { ...node.config, ...patch } });
  const sources = (input) => {
    const choices = sourceChoices(node, input, nodes, fields);
    return (
      <label key={input.key}>
        {input.label}
        <select
          value={node.mappings[input.key] || ""}
          onChange={(e) =>
            onChange({
              ...node,
              mappings: { ...node.mappings, [input.key]: e.target.value },
            })
          }
        >
          <option value="">
            Choose a source{input.optional ? " (optional)" : ""}
          </option>
          {choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {node.mappings[input.key] &&
          !choices.some((c) => c.value === node.mappings[input.key]) && (
            <small className="error">
              Source changed or is incompatible. Choose again.
            </small>
          )}
      </label>
    );
  };
  const typePicker = (
    <label>
      Value type
      <select
        value={node.config.valueType}
        onChange={(e) =>
          onChange({
            ...node,
            mappings: {},
            config: {
              ...node.config,
              valueType: e.target.value,
              operator: "eq",
              expected: "",
            },
          })
        }
      >
        {valueTypes.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
    </label>
  );
  const tool = [...actionTools, ...publicationTools].find(
    (t) => t.kind === node.config.tool,
  );
  return (
    <aside className="studio-settings">
      <h2>{nodeDefinition(node).name}</h2>
      <p>Configure this step, then use Test & review to run your workflow.</p>
      {["action", "plugin"].includes(node.kind) ? (
        <>
          {node.kind === "plugin" ? (
            <>
              <p>Plugin: Publication</p>
              <button className="btn" onClick={() => setPicker(true)}>
                Choose publication tool
              </button>
              {picker && (
                <PluginPicker
                  onClose={() => setPicker(false)}
                  onChoose={(plugin, kind) => {
                    const t = createNode(kind);
                    onChange({
                      ...node,
                      name: t.name,
                      mappings: {},
                      routes: Object.fromEntries(
                        Object.keys(t.routes).map((r) => [
                          r,
                          node.routes[r] || "",
                        ]),
                      ),
                      config: { plugin, tool: kind, settings: t.config },
                    });
                    setPicker(false);
                  }}
                />
              )}
            </>
          ) : (
            <label>
              Tool
              <select
                value={node.config.tool}
                onChange={(e) =>
                  onChange(
                    e.target.value
                      ? suggestMappings(
                          chooseActionTool(node, e.target.value),
                          nodes,
                          fields,
                        )
                      : {
                          ...node,
                          mappings: {},
                          config: { tool: "", settings: {} },
                        },
                  )
                }
              >
                <option value="">Choose a tool</option>
                {reusableActionTools.map((t) => (
                  <option key={t.kind} value={t.kind}>
                    {t.name}
                  </option>
                ))}
                {publicationTools.some((t) => t.kind === node.config.tool) && (
                  <option value={node.config.tool}>
                    {tool?.name} (existing publication step)
                  </option>
                )}
              </select>
              <small>
                Publication tools are available through the Plugin block.
              </small>
            </label>
          )}
          {tool ? (
            <NodeSettings
              policy={policy}
              embedded
              node={{ ...node, kind: tool.kind, config: node.config.settings }}
              nodes={nodes}
              fields={fields}
              onRemove={onRemove}
              onChange={(updated) =>
                onChange({
                  ...node,
                  name: updated.name,
                  mappings: updated.mappings,
                  routes: updated.routes,
                  config: {
                    ...node.config,
                    tool: tool.kind,
                    settings: updated.config,
                  },
                })
              }
            />
          ) : (
            <button className="btn danger" onClick={onRemove}>
              Remove this step
            </button>
          )}
        </>
      ) : (
        <>
          <label>
            Step name
            <input
              value={node.name}
              onChange={(e) => onChange({ ...node, name: e.target.value })}
            />
          </label>
          {["condition", "result"].includes(node.kind) && (
            <>
              {typePicker}
              {nodeDefinition(node).inputs.map(sources)}
            </>
          )}
          {node.kind === "condition" && (
            <>
              <label>
                Comparison
                <select
                  value={node.config.operator}
                  onChange={(e) => config({ operator: e.target.value })}
                >
                  <option value="eq">Equals</option>
                  <option value="ne">Does not equal</option>
                  {["number", "date"].includes(node.config.valueType) && (
                    <>
                      <option value="gte">
                        {node.config.valueType === "date"
                          ? "On or after"
                          : "At least"}
                      </option>
                      <option value="lte">
                        {node.config.valueType === "date"
                          ? "On or before"
                          : "At most"}
                      </option>
                    </>
                  )}
                </select>
              </label>
              <label>
                Compare with
                {node.config.valueType === "boolean" ? (
                  <select
                    value={node.config.expected}
                    onChange={(e) => config({ expected: e.target.value })}
                  >
                    <option value="">Choose</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    type={
                      node.config.valueType === "text"
                        ? "text"
                        : node.config.valueType
                    }
                    value={node.config.expected}
                    onChange={(e) => config({ expected: e.target.value })}
                  />
                )}
              </label>
              <p>
                Met = condition passed. Not met = condition failed. Missing
                information goes to Needs review.
              </p>
            </>
          )}
          {node.kind === "human_review" && (
            <>
              <label>
                Reviewer role
                <input
                  value={node.config.role}
                  onChange={(e) => config({ role: e.target.value })}
                />
              </label>
              <label>
                Review instructions
                <textarea
                  value={node.config.instructions}
                  onChange={(e) => config({ instructions: e.target.value })}
                />
              </label>
              <p>
                This is an optional terminal handoff. The automated workflow ends
                here and the separate Human Review module receives the complete
                submission, evidence, AI evaluation and scoring package. It does
                not create approval or rejection branches in this workflow.
              </p>
            </>
          )}
          {node.kind === "result" && (
            <label>
              Outcome name
              <input
                placeholder="Eligible, completed, pending…"
                value={node.config.outcome}
                onChange={(e) => config({ outcome: e.target.value })}
              />
            </label>
          )}
          {Object.keys(node.routes).length > 0 && (
            <details>
              <summary>Connect to existing steps</summary>
              {Object.keys(node.routes).map((route) => (
                <label key={route}>
                  {{
                    clear: "Met",
                    failed: "Not met",
                    uncertain: "Needs review",
                    approved: "Approved",
                    rejected: "Rejected",
                    clarification: "Clarification",
                  }[route] || route}
                  <select
                    value={node.routes[route] || ""}
                    onChange={(e) =>
                      onChange({
                        ...node,
                        routes: { ...node.routes, [route]: e.target.value },
                      })
                    }
                  >
                    <option value="">
                      Choose a step, or use + on the tree
                    </option>
                    {nodes
                      .filter((n) => n.id !== node.id && n.kind !== "submit")
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
            </details>
          )}
          <button className="btn danger" onClick={onRemove}>
            Remove this step
          </button>
        </>
      )}
    </aside>
  );
}
