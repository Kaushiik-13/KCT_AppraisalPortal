import React, { useEffect, useRef, useState } from "react";
import { plugins } from "./workflowModel";

export default function PluginPicker({
  onChoose,
  onClose,
  mode = "operation",
  hasExistingWorkflow = false,
}) {
  const dialog = useRef(null);
  const [selected, setSelected] = useState("");
  const [confirmReplace, setConfirmReplace] = useState(false);
  const plugin = plugins.find((item) => item.id === selected);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const choosePlugin = (pluginId) => {
    if (hasExistingWorkflow) {
      setSelected(pluginId);
      setConfirmReplace(true);
      return;
    }
    onChoose(pluginId);
  };

  const confirmPlugin = () => {
    if (plugin) onChoose(plugin.id);
  };

  return (
    <dialog ref={dialog} className="plugin-dialog" onCancel={onClose}>
      <div className="tree-panel-heading">
        <h2>
          {confirmReplace
            ? "Replace current workflow?"
            : mode === "workflow"
              ? "Choose a complete workflow"
              : plugin
                ? plugin.name
                : "Choose a plugin"}
        </h2>
        <button aria-label="Close plugin picker" onClick={onClose}>
          ×
        </button>
      </div>
      {mode === "workflow" ? (
        confirmReplace ? (
          <>
            <p>
              Your current steps will be replaced with the complete Publication
              workflow. You can undo this change from the workflow toolbar.
            </p>
            <div className="button-row plugin-confirm-actions">
              <button className="btn" onClick={() => setConfirmReplace(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={confirmPlugin}>
                Replace and add workflow
              </button>
            </div>
          </>
        ) : (
          <div className="plugin-options">
            {plugins.map((item) => (
              <button key={item.id} onClick={() => choosePlugin(item.id)}>
                <strong>{item.name} workflow</strong>
                <small>
                  Checks the PDF against Crossref, matches the first author,
                  checks the assessment date, and sends uncertain findings to review.
                </small>
              </button>
            ))}
          </div>
        )
      ) : plugin ? (
        <>
          <button className="mini" onClick={() => setSelected("")}>
            ← All plugins
          </button>
          <p>Choose the publication tool to add to this step.</p>
          <div className="plugin-options">
            {plugin.tools.map((tool) => (
              <button
                key={tool.kind}
                onClick={() => onChoose(plugin.id, tool.kind)}
              >
                <strong>{tool.name}</strong>
                <small>{tool.description}</small>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="plugin-options">
          {plugins.map((item) => (
            <button key={item.id} onClick={() => setSelected(item.id)}>
              <strong>{item.name}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
      )}
    </dialog>
  );
}
