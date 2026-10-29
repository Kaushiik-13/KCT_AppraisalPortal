import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

const metric = (value, digits = 2) => Number.isFinite(value) ? Number(value).toFixed(digits) : "—";

export default function ModelApprovalPanel({ result, model, busy, errors, onDecision, onBack, onContinue }) {
  const candidate = result.candidates.find((entry) => entry.modelId === model?.id)
    || result.candidates.find((entry) => entry.id === result.recommendation.candidateId);
  const [reviewer, setReviewer] = useState("Prototype Administrator");
  const [note, setNote] = useState("Synthetic held-out metrics, limitations, and compatibility scope reviewed.");
  const decided = Boolean(model && model.lifecycle !== "candidate");
  const recordedDecision = model?.approval?.decision;

  return (
    <section className="prediction-page-section" aria-labelledby="model-approval-title">
      <div className="prediction-section-heading">
        <div><span className="prediction-kicker">SCREEN 6 · EVALUATION AND APPROVAL</span><h1 id="model-approval-title">Review the candidate before publication.</h1><p>This is simulated model governance. It is not the employee KPI Human Review module and cannot change an appraisal outcome.</p></div>
        <button className="prediction-btn" onClick={onBack}>Back to comparison</button>
      </div>

      <div className="prediction-governance-layout">
        <div className="prediction-model-column">
          <article className="prediction-model-card">
            <div className="prediction-model-card-heading"><ShieldCheck size={19} /><div><h2>{candidate?.label || "Recommended candidate"}</h2><p>{result.recommendation.reason}</p></div><span className="prediction-status-pill success">gate passed</span></div>
            <div className="prediction-evaluation-grid">
              <div><span>MAE</span><strong>{metric(candidate?.metrics?.mae)}</strong></div>
              <div><span>RMSE</span><strong>{metric(candidate?.metrics?.rmse)}</strong></div>
              <div><span>Normalized MAE</span><strong>{metric(candidate?.metrics?.normalizedMae, 3)}</strong></div>
              <div><span>R²</span><strong>{metric(candidate?.metrics?.rSquared, 3)}</strong></div>
              <div><span>Range radius</span><strong>±{metric(candidate?.metrics?.expectedRange?.radius)}</strong></div>
              <div><span>Held-out coverage</span><strong>{metric(candidate?.metrics?.expectedRange?.empiricalCoverage * 100, 1)}%</strong></div>
            </div>
          </article>

          <article className="prediction-model-card">
            <h2>Immutable candidate metadata</h2>
            <dl className="prediction-metadata-list">
              <div><dt>Model ID</dt><dd>{model?.id || candidate?.modelId}</dd></div>
              <div><dt>Training run</dt><dd>{result.runId}</dd></div>
              <div><dt>Dataset snapshot</dt><dd>{result.snapshotId}</dd></div>
              <div><dt>Dataset checksum</dt><dd>{result.snapshotChecksum}</dd></div>
              <div><dt>Configuration checksum</dt><dd>{result.configurationChecksum}</dd></div>
              <div><dt>Train / test rows</dt><dd>{result.split.trainRows} / {result.split.testRows}</dd></div>
            </dl>
          </article>

          <article className="prediction-model-card">
            <h2>Feature and compatibility scope</h2>
            <div className="prediction-chip-list approval-features">{result.featureSchema.selected.map((feature) => <span key={feature}>{feature.replaceAll("_", " ")}</span>)}</div>
            <p className="prediction-card-help">Policy {model?.compatibility.policyVersion} · Framework {model?.compatibility.frameworkVersion} · Target {model?.target}</p>
          </article>
        </div>

        <div className="prediction-model-column">
          <article className="prediction-limitations-card">
            <AlertTriangle size={20} />
            <div><h2>Limitations to acknowledge</h2><ul><li>All training and evaluation records are synthetic.</li><li>The range is empirical held-out evidence, not a guaranteed probability.</li><li>No subgroup/fairness or real-world stability claim is available.</li><li>Approval does not publish or activate the model.</li></ul></div>
          </article>

          <article className="prediction-model-card">
            <h2>Simulated administrator decision</h2>
            <p className="prediction-card-help">A final note is required for either approval or rejection. The decision cannot be changed for this candidate.</p>
            {errors.length ? <div className="prediction-alert danger" role="alert"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
            <label className="prediction-review-field"><span>Reviewer</span><input value={reviewer} disabled={decided || busy} maxLength="80" onChange={(event) => setReviewer(event.target.value)} /></label>
            <label className="prediction-review-field"><span>Decision note</span><textarea value={note} disabled={decided || busy} rows="5" maxLength="500" onChange={(event) => setNote(event.target.value)} /></label>
            {!decided ? (
              <div className="prediction-decision-actions">
                <button className="prediction-btn danger" disabled={busy} onClick={() => onDecision("rejected", reviewer, note)}><XCircle size={16} />Reject candidate</button>
                <button className="prediction-btn primary" disabled={busy} onClick={() => onDecision("approved", reviewer, note)}><CheckCircle2 size={16} />{busy ? "Recording…" : "Approve candidate"}</button>
              </div>
            ) : (
              <div className={`prediction-decision-result ${recordedDecision}`}>
                {recordedDecision === "approved" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                <div><strong>Candidate {recordedDecision}</strong><p>{model.approval.note}</p><small>{model.approval.reviewer} · {new Date(model.approval.decidedAt).toLocaleString()}</small></div>
              </div>
            )}
          </article>

          {recordedDecision === "approved" ? <button className="prediction-btn primary prediction-full-button" onClick={onContinue}>{model.lifecycle === "approved" ? "Continue to publication" : "View publication"}</button> : null}
        </div>
      </div>
    </section>
  );
}
