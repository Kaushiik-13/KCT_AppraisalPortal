import React, { useState } from "react";
import ResultSummary, { FactList } from "./ResultSummary";
export function SubmissionFields({ fields, values, onValue, disabled }) {
  return (
    <fieldset className="test-fields" disabled={disabled}>
      <legend>Test submission</legend>
      {fields.map((f) => {
        const v = values[f.id];
        const opts = (f.options || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        return (
          <label key={f.id}>
            {f.label}
            {f.required ? " *" : ""}
        {f.help && <small>{f.help}</small>}
        {f.example && <small>Example: {f.example}</small>}
            {f.type === "file" ? (
              <>
                <input
                  type="file"
                  accept={f.accept}
                  multiple={f.multiple}
                  onChange={(e) =>
                    onValue(f.id, Array.from(e.target.files || []))
                  }
                />
                <small>
                  {v?.length
                    ? v.map((x) => x.name).join(", ")
                    : "No file selected."}
                </small>
              </>
            ) : f.type === "textarea" ? (
              <textarea
                value={v || ""}
                onChange={(e) => onValue(f.id, e.target.value)}
              />
            ) : ["select", "boolean"].includes(f.type) ? (
              <select
                value={v ?? ""}
                onChange={(e) => onValue(f.id, e.target.value)}
              >
                <option value="">Choose an answer</option>
                {(f.type === "boolean" ? ["Yes", "No"] : opts).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === "multi" ? (
              <div>
                {opts.map((o) => (
                  <label className="check-row" key={o}>
                    <input
                      type="checkbox"
                      checked={(v || []).includes(o)}
                      onChange={(e) =>
                        onValue(
                          f.id,
                          e.target.checked
                            ? [...(v || []), o]
                            : (v || []).filter((x) => x !== o),
                        )
                      }
                    />
                    {o}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type={
                  f.type === "integer"
                    ? "number"
                    : f.type === "datetime"
                      ? "datetime-local"
                      : f.type
                }
                step={f.type === "integer" ? 1 : "any"}
                value={v ?? ""}
                onChange={(e) => onValue(f.id, e.target.value)}
              />
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
function JsonDetails({ data }) {
  return (
    <pre className="result-json">
      {JSON.stringify(
        data,
        (k, v) => (k === "items" ? undefined : v),
        2,
      )}
    </pre>
  );
}
function StepResult({ step }) {
  const result = Object.values(step.output || {})[0];
  if (
    ["condition", "result", "human_review"].includes(step.kind) ||
    step.kind.startsWith("read_")
  )
    return (
      <details className="trace-step" open>
        <summary>
          <strong>{step.name}</strong>
          <span>
            {step.error
              ? "Stopped"
              : step.kind === "condition"
                ? {
                    clear: "Met",
                    failed: "Not met",
                    uncertain: "Needs review",
                  }[result?.status] || "Completed"
                : result?.status || "Completed"}
          </span>
        </summary>
        {step.error ? (
          <p className="error">{step.error}</p>
        ) : step.kind === "condition" ? (
          <p>
            {String(result.actual ?? "Missing value")}{" "}
            {
              {
                eq: "equals",
                ne: "does not equal",
                gte:
                  result.valueType === "date"
                    ? "is on or after"
                    : "is at least",
                lte:
                  result.valueType === "date"
                    ? "is on or before"
                    : "is at most",
              }[result.operator]
            }{" "}
            {String(result.expected)}:{" "}
            {result.status === "clear"
              ? "Met"
              : result.status === "failed"
                ? "Not met"
                : "Needs review"}
          </p>
        ) : step.kind === "result" ? (
          <p>
            {result.outcome}
            {result.value !== null ? ` - ${String(result.value)}` : ""}
          </p>
        ) : step.kind === "human_review" ? (
          <p>
            {result.action
              ? `${result.action} by ${result.reviewer}. ${result.reason}`
              : `Waiting for ${result.role}. ${result.instructions}`}
          </p>
        ) : (
          <p>Value: {result === null ? "Missing" : String(result)}</p>
        )}
      </details>
    );
  return (
    <details
      className="trace-step"
      open={
        step.kind === "decision" ||
        step.kind === "score" ||
        step.status === "error"
      }
    >
      <summary>
        <strong>{step.name}</strong>
        <span>
          {step.status === "error"
            ? "Stopped"
            : step.kind === "extract"
              ? "PDF read"
              : result?.status || "Completed"}
        </span>
      </summary>
      {step.error ? (
        <p className="error">{step.error}</p>
      ) : step.kind === "extract" ? (
        <>
          <p>{result.pageCount} pages read. Extracted values are candidates.</p>
          {result.findings.map((f) => (
            <div className="finding-line" key={f.name}>
              <strong>{f.name}</strong>
              <p>
                {Array.isArray(f.value)
                  ? f.value.join(" · ")
                  : f.value || "Not found"}
              </p>
              {f.source && (
                <details>
                  <summary>
                    Evidence ·{" "}
                    {f.source.metadata
                      ? `PDF ${f.source.metadata} metadata`
                      : `page ${f.source.page}`}
                  </summary>
                  <blockquote>{f.source.excerpt || "Metadata only"}</blockquote>
                </details>
              )}
            </div>
          ))}
          <details>
            <summary>Read PDF text by page</summary>
            {result.pages.map((p) => (
              <details key={p.number}>
                <summary>Page {p.number}</summary>
                <pre>
                  {p.text || "No readable text. OCR or manual review required."}
                </pre>
              </details>
            ))}
          </details>
        </>
      ) : step.kind === "compare" ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Finding</th>
                <th>PDF</th>
                <th>Lookup</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {result.findings.map((f) => (
                <tr key={f.field}>
                  <td>{f.field}</td>
                  <td>
                    {Array.isArray(f.pdf)
                      ? f.pdf.join(", ")
                      : f.pdf || "Missing"}
                  </td>
                  <td>{f.external || "Missing"}</td>
                  <td>{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>{result.reason}</p>
        </>
      ) : step.kind === "score" ? (
        <>
          <h3>
            {result.points === null
              ? "Pending"
              : `${result.points} provisional points`}
          </h3>
          <p>
            Policy: {result.policyVersion}
            {result.simulated ? " · Uses mock index evidence" : ""}
          </p>
          <ul>
            {result.trace.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <details>
            <summary>Policy snapshot</summary>
            <JsonDetails data={result.policy} />
          </details>
        </>
      ) : step.kind === "decision" ? (
        <>
          <p>
            Outcome: <strong>{result.status}</strong>
            {result.simulated ? " · Mock index evidence" : ""}
          </p>
          <ul>
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <FactList facts={result.facts} />
        </>
      ) : step.kind === "submit" ? (
        <p>
          Required fields and data types passed validation. Submission stays in
          this browser session.
        </p>
      ) : (
        <ResultSummary kind={step.kind} result={result} />
      )}
    </details>
  );
}
export function ReviewForm({ run, onDecide, disabled }) {
  const score =
    run.review.score?.points ??
    (run.review.decision.status === "ineligible" ? 0 : null);
  const [action, setAction] = useState(score === null ? "clarify" : "approve");
  const [reason, setReason] = useState("");
  const [points, setPoints] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await onDecide({ action, reason, points, reviewer });
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <form className="review-form" onSubmit={submit}>
      <h2>Appraiser review</h2>
      <p>
        {score === null
          ? "The recommendation is pending. Resolve the evidence with a new test, or record a reasoned override."
          : `Recommended score: ${score} points.`}
      </p>
      {run.review.decision.simulated && (
        <div className="studio-warning">
          Rehearsal using mock index evidence. Approval is recorded only in this
          session.
        </div>
      )}
      <fieldset disabled={disabled}>
        <legend>Decision</legend>
        <label>
          Appraiser name
          <input
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
          />
        </label>
        <label>
          Action
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="approve" disabled={score === null}>
              Approve recommendation
            </option>
            <option value="reject">Reject</option>
            <option value="clarify">Request clarification</option>
            <option value="override">Override with a reason</option>
          </select>
        </label>
        {action === "override" && (
          <label>
            Approved points
            <input
              type="number"
              min="0"
              step="any"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </label>
        )}
        <label>
          Reason {action !== "approve" ? "(required)" : "(optional)"}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button className="btn primary" type="submit">
          Record decision
        </button>
      </fieldset>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </form>
  );
}
export function RunResults({ run, busy, progress, stale, onDecide, history }) {
  return (
    <section className="run-results">
      <h2>Execution trace</h2>
      {busy && <p role="status">{progress || "Running…"}</p>}
      {!run && !busy && (
        <p>Run your workflow to inspect every step and its evidence.</p>
      )}
      {stale && (
        <div className="studio-warning">
          The workflow or submission changed. Run again before reviewing these
          results.
        </div>
      )}
      {run?.issues?.length > 0 && (
        <div className="studio-warning" role="alert">
          <strong>Before this workflow can finish:</strong>
          <ul>
            {run.issues.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {run?.snapshot && (
        <p>
          {run.trace.length} of {run.snapshot.length} steps ran.{" "}
          {run.trace.length === run.snapshot.length
            ? "All steps ran."
            : `${run.snapshot
                .filter((n) => !run.trace.some((s) => s.id === n.id))
                .map((n) => n.name)
                .join(", ")} have not run on this path.`}
        </p>
      )}
      {run?.trace.map((s, i) => (
        <StepResult step={s} key={`${s.id}-${i}`} />
      ))}
      {run?.status === "awaiting-review" &&
        (run.genericReview ? (
          <GenericReviewForm
            key={run.id}
            run={run}
            onDecide={onDecide}
            disabled={stale || busy}
          />
        ) : (
          <ReviewForm
            key={run.id}
            run={run}
            onDecide={onDecide}
            disabled={stale || busy}
          />
        ))}{" "}
      {run?.result && (
        <div className="studio-outcome">
          <strong>Outcome: {run.result.outcome}</strong>
          {run.result.value !== null && (
            <p>Value: {String(run.result.value)}</p>
          )}
        </div>
      )}
      {run?.scoring && (
        <div
          className={
            run.scoring.status === "pending"
              ? "studio-warning"
              : "studio-success"
          }
        >
          <strong>
            {run.scoring.points === null
              ? "Score pending review"
              : `${run.scoring.points} points`}
          </strong>
          <p>
            Scoring outcome: {run.scoring.outcome} | Policy{" "}
            {run.scoring.version}
          </p>
          <details>
            <summary>Calculation and policy snapshot</summary>
            <JsonDetails data={run.scoring} />
          </details>
        </div>
      )}
      {run?.decisions?.length > 0 && (
        <details>
          <summary>Review decisions ({run.decisions.length})</summary>
          <JsonDetails data={run.decisions} />
        </details>
      )}
      {run?.final && (
        <div className="studio-success">
          <strong>Decision recorded: {run.final.action}</strong>
          <p>
            {run.final.approvedScore === null
              ? "Clarification requested. Update the evidence/settings and run a fresh test."
              : `Final score: ${run.final.approvedScore}. Original recommendation: ${run.final.originalScore ?? "pending"}.`}
          </p>
          <p>{run.final.reason}</p>
        </div>
      )}
      {history.length > 0 && (
        <details>
          <summary>Session decision history ({history.length})</summary>
          <JsonDetails data={history} />
        </details>
      )}
    </section>
  );
}

function GenericReviewForm({ run, onDecide, disabled }) {
  const [reviewer, setReviewer] = useState(""),
    [action, setAction] = useState("approved"),
    [reason, setReason] = useState(""),
    [points, setPoints] = useState(""),
    [error, setError] = useState("");
  return (
    <form
      className="review-form"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await onDecide({ reviewer, action, reason, points });
          setError("");
        } catch (e) {
          setError(e.message);
        }
      }}
    >
      <h2>{run.review.role} review</h2>
      <p>{run.review.instructions}</p>
      <details open>
        <summary>Evidence package</summary>
        <p>
          Review the original submission, extracted candidates, comparison
          findings, AI recommendation, scoring and policy before deciding.
        </p>
        <JsonDetails data={run.review.package} />
      </details>
      <fieldset disabled={disabled}>
        <label>
          Reviewer name
          <input
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
          />
        </label>
        <label>
          Decision
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
            <option value="clarification">Request clarification</option>
            <option value="override">Override score with reason</option>
          </select>
        </label>
        {action === "override" && (
          <label>
            Final score
            <input
              type="number"
              min="0"
              step="any"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </label>
        )}
        <label>
          Reason {action === "approved" ? "(optional)" : "(required)"}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button className="btn primary" type="submit">
          Record and continue
        </button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
