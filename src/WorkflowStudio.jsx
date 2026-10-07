import React, { useState, useRef, useMemo } from "react";
import { Play } from "lucide-react";
import { exampleWorkflow } from "./workflowModel";
import {
  runWorkflow,
  finalizeReview,
  resumeWorkflow,
  validateRunConfiguration,
} from "./workflowEngine";
import TreeBuilder from "./TreeBuilder";
import { SubmissionFields, RunResults } from "./WorkflowTest";
export default function WorkflowStudio({
  policy,
  nodes,
  setNodes,
  fields,
  values,
  onValue,
  onInputs,
  onPolicy,
  hidden,
}) {
  const [view, setView] = useState("build");
  const [run, setRun] = useState(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [progress, setProgress] = useState("");
  const [records, setRecords] = useState([]);
  const [history, setHistory] = useState([]);
  const [notice, setNotice] = useState("");
  const captured = useRef(null);
  const reviewed = useRef(new Set());
  const [focusId, setFocusId] = useState("");
  const issues = useMemo(
    () => validateRunConfiguration({ nodes, fields, policy }),
    [nodes, fields, policy],
  );
  const publication = nodes.some((n) =>
    ["extract", "lookup", "index"].includes(
      ["action", "plugin"].includes(n.kind) ? n.config.tool : n.kind,
    ),
  );
  const stale =
    !!run &&
    !!captured.current &&
    (captured.current.policy !== policy ||
      captured.current.nodes !== nodes ||
      captured.current.fields !== fields ||
      captured.current.values !== values);
  const change = (next) => {
    setNodes(next);
  };

  const example = () => {
    if (nodes.length) {
      setNotice(
        "Your workflow has been kept. Remove its steps before loading an example.",
      );
      return;
    }
    const next = exampleWorkflow(fields).map((n) =>
      ["submit", "ai"].includes(n.kind)
        ? n
        : {
            ...n,
            kind: "plugin",
            config: { plugin: "publication", tool: n.kind, settings: n.config },
          },
    );
    change(next);
    setNotice(
      "Editable example loaded. Indexing is simulated; AI uses OpenRouter when a local key is configured. Review the dates, connections, and scoring rules.",
    );
  };
  const test = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNotice("");
    setRun(null);
    setView("test");
    captured.current = { nodes, fields, values, policy };
    try {
      const result = await runWorkflow({
        policy,
        nodes: structuredClone(nodes),
        fields,
        values,
        records,
        extract: async (file) => {
          const { readEvidence } = await import("./documentReader");
          return readEvidence(file, setProgress);
        },
        onStep: (s) => {
          setProgress(`${nodes.find((n) => n.id === s.id)?.name}: ${s.status}`);
          if (s.trace) setRun({ status: "running", trace: s.trace });
        },
      });
      setRun(result);
    } catch (e) {
      setRun({ status: "error", issues: [e.message], trace: [] });
    } finally {
      setBusy(false);
      busyRef.current = false;
      setProgress("");
    }
  };
  const decide = async (data) => {
    if (busyRef.current) throw Error("A decision is being processed.");
    if (run?.genericReview) {
      if (stale) throw Error("Run again after changing inputs or settings.");
      busyRef.current = true;
      setBusy(true);
      try {
        const next = await resumeWorkflow(run, data);
        setRun(next);
        setHistory((prev) => [
          ...prev,
          ...(next.decisions || []).slice(run.decisions.length),
        ]);
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
      return;
    }
    if (reviewed.current.has(run?.id))
      throw Error("This decision was already recorded.");
    if (stale) throw Error("Run again after changing inputs or settings.");
    const final = finalizeReview(run, data);
    reviewed.current.add(run.id);
    setRun({ ...run, status: "reviewed", final });
    setHistory((prev) => [
      ...prev,
      {
        ...final,
        workflow: run.snapshot,
        findings: run.review.decision,
        policy: run.review.score?.policy || null,
      },
    ]);
    if (["approve", "override"].includes(final.action)) {
      const duplicate = run.trace.find((s) => s.kind === "duplicate")?.output
        .duplicate;
      if (duplicate?.doi && duplicate?.faculty)
        setRecords((prev) => [
          ...prev,
          {
            doi: duplicate.doi,
            faculty: duplicate.faculty,
            runId: run.id,
            score: final.approvedScore,
          },
        ]);
    }
  };
  const sample = async () => {
    setNotice("");
    try {
      const extract = nodes.find(
        (n) =>
          n.kind === "extract" ||
          (["action", "plugin"].includes(n.kind) &&
            n.config.tool === "extract"),
      );
      const fileId =
        extract?.mappings.file?.split("|")[1] ||
        fields.find((f) => f.type === "file")?.id;
      if (!fileId) throw Error("Create a PDF input field first.");
      const response = await fetch("/samples/prisma-2020-paper.pdf");
      if (!response.ok) throw Error("Sample PDF could not be loaded.");
      onValue(fileId, [
        new File([await response.blob()], "prisma-2020-paper.pdf", {
          type: "application/pdf",
        }),
      ]);
      for (const f of fields) {
        if (f.type === "text" && /faculty|name/i.test(f.label))
          onValue(f.id, "Matthew J. Page");
        else if (f.type === "text" && /doi/i.test(f.label))
          onValue(f.id, "10.1371/journal.pmed.1003583");
        else if (f.type === "url")
          onValue(
            f.id,
            "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1003583",
          );
      }
      setNotice(
        "Sample filled. Paper date: 29 March 2021. Use an assessment period covering that date for an eligible test.",
      );
    } catch (e) {
      setNotice(e.message);
    }
  };
  const exportConfig = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { format: "afpi-workflow-v1", fields, nodes, policy },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "afpi-workflow.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section
      hidden={hidden}
      className={`workflow-view studio tree-studio ${view === "build" ? "tree-build-view" : ""}`}
    >
      <div className="studio-top">
        <div>
          <div className="eyebrow">FRAMEWORK STUDIO</div>
          <h2>Verification workflow</h2>
          <p>
            Arrange your steps and branches. Select a step when you need its
            settings.
          </p>
        </div>
        <div className="button-row">
          <button
            className="btn"
            disabled={busy || !nodes.length}
            onClick={exportConfig}
          >
            Export configuration
          </button>
          <button
            className="btn primary"
            disabled={busy || !nodes.length || issues.length > 0}
            onClick={test}
          >
            <Play size={15} />
            {busy ? "Running…" : "Run workflow"}
          </button>
        </div>
      </div>
      <div className="studio-tabs">
        <button
          className={view === "build" ? "active" : ""}
          onClick={() => setView("build")}
        >
          Build workflow
        </button>
        <button
          className={view === "test" ? "active" : ""}
          onClick={() => setView("test")}
        >
          Test & review
        </button>
        <span>
          {publication ? "Mock indexing" : "Session testing"} · {records.length}{" "}
          approved records
        </span>
      </div>
      {notice && (
        <div className="studio-warning" role="status">
          {notice}
        </div>
      )}
      {view === "build" ? (
        <TreeBuilder
          policy={policy}
          toolbarStart={
            <div className="canvas-view-tabs">
              <button className="active" aria-current="page">
                Build workflow
              </button>
              <button onClick={() => setView("test")}>Test & review</button>
            </div>
          }
          nodes={nodes}
          fields={fields}
          onChange={change}
          disabled={busy}
          onExample={example}
          initialSelected={focusId}
        />
      ) : (
        <div className="studio-test">
          <section>
            <div className="test-readiness">
              <strong>
                {issues.length
                  ? `Finish setup: ${issues.length} ${issues.length === 1 ? "item" : "items"}`
                  : "Workflow ready to test"}
              </strong>
              {issues.length > 0 ? (
                <ul>
                  {issues.map((issue, i) => {
                    const node = nodes.find((n) =>
                      issue.startsWith(`${n.name}:`),
                    );
                    return (
                      <li key={i}>
                        {issue}
                        {node && (
                          <button
                            className="mini"
                            onClick={() => {
                              setFocusId(node.id);
                              setView("build");
                            }}
                          >
                            Edit step
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>
                  Enter a submission, then run it to see the path taken and its
                  result.
                </p>
              )}
              {issues.length > 0 && (
                <div className="button-row">
                  <button className="mini" onClick={() => setView("build")}>
                    Edit workflow
                  </button>
                  <button className="mini" onClick={onPolicy}>
                    Edit policy
                  </button>
                </div>
              )}
            </div>
            <div className="button-row">
              {publication && (
                <button className="btn" disabled={busy} onClick={sample}>
                  Fill sample submission
                </button>
              )}
              <button className="btn" disabled={busy} onClick={onInputs}>
                Edit input fields
              </button>
            </div>
            <p className="test-help">
              {publication ? (
                <>
                  Upload once. All connected steps reuse the same evidence. The
                  PDF stays local. Its DOI is sent to Crossref; selected AI
                  inputs and your system instructions are sent to OpenRouter
                  when live AI is selected.
                </>
              ) : (
                "Enter test values below. Only the selected branch runs. Human review pauses until a decision is recorded."
              )}
            </p>
            {policy?.enabled && (
              <p className="test-help">
                Scoring uses saved policy:{" "}
                <strong>{policy.activeVersion || "No version selected"}</strong>
                . Draft edits apply only after saving a new version.
              </p>
            )}
            <SubmissionFields
              fields={fields}
              values={values}
              onValue={onValue}
              disabled={busy}
            />
            <button
              className="btn primary"
              disabled={busy || !nodes.length || issues.length > 0}
              onClick={test}
            >
              <Play size={15} />
              Run this submission
            </button>
            {publication && (
              <p className="test-help">
                Sample: Matthew J. Page · Published 29 March 2021.
                <br />
                <a href="/samples/prisma-2020-paper.pdf" download>
                  Download sample paper
                </a>{" "}
                ·{" "}
                <a
                  href="https://doi.org/10.1371/journal.pmed.1003583"
                  target="_blank"
                  rel="noreferrer"
                >
                  Publication page
                </a>
              </p>
            )}
          </section>
          <RunResults
            run={run}
            busy={busy}
            progress={progress}
            stale={stale}
            onDecide={decide}
            history={history}
          />
        </div>
      )}
    </section>
  );
}
