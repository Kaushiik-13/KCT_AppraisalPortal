import { useMemo, useState } from "react";
import { AlertTriangle, FlaskConical, Gauge, ShieldCheck } from "lucide-react";

const HISTORY_OPTIONS = [
  { id: "current", label: "Scenario A · No history" },
  { id: "limited", label: "Scenario B · Limited history" },
  { id: "sufficient", label: "Scenario C · Sufficient history" },
  { id: "invalid", label: "Invalid history · Expected block" },
];

export default function PredictionSandbox({ generated, model, busy, errors, result, onPredict, onReset, onBack }) {
  const activeRows = generated.datasets.current.rows;
  const employeeOptions = useMemo(() => activeRows.toSorted((left, right) => left.employee_key.localeCompare(right.employee_key)), [activeRows]);
  const [employeeKey, setEmployeeKey] = useState(employeeOptions[0]?.employee_key || "");
  const [historyId, setHistoryId] = useState("sufficient");
  const current = employeeOptions.find((row) => row.employee_key === employeeKey);

  return (
    <section className="prediction-page-section" aria-labelledby="prediction-sandbox-title">
      <div className="prediction-section-heading">
        <div><span className="prediction-kicker">SCREEN 8 · PREDICTION SANDBOX</span><h1 id="prediction-sandbox-title">Try a read-only synthetic prediction.</h1><p>Select a current synthetic employee checkpoint and history scenario. The result is advisory and cannot update the official appraisal score.</p></div>
        <button className="prediction-btn" onClick={onBack}>Back to publication</button>
      </div>

      <div className="prediction-sandbox-layout">
        <aside className="prediction-model-card prediction-sandbox-controls">
          <div className="prediction-model-card-heading"><FlaskConical size={19} /><div><h2>Sandbox input</h2><p>Only committed synthetic fixture records are available.</p></div></div>
          <label><span>Synthetic employee checkpoint</span><select value={employeeKey} onChange={(event) => { setEmployeeKey(event.target.value); onReset(); }}>{employeeOptions.map((row) => <option key={row.record_id} value={row.employee_key}>{row.employee_key} · {row.role_code.replaceAll("_", " ")}</option>)}</select></label>
          <label><span>History readiness scenario</span><select value={historyId} onChange={(event) => { setHistoryId(event.target.value); onReset(); }}>{HISTORY_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          {current ? (
            <div className="prediction-current-card">
              <div><span>Current verified score</span><strong>{current.current_overall_score}</strong></div>
              <div><span>Cycle elapsed</span><strong>{Math.round(current.elapsed_fraction * 100)}%</strong></div>
              <div><span>Time remaining</span><strong>{current.remaining_days} days</strong></div>
              <div><span>Evidence</span><strong>{current.verified_evidence_count}</strong></div>
            </div>
          ) : null}
          {errors.length ? <div className="prediction-alert danger" role="alert"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
          <button className="prediction-btn primary prediction-full-button" disabled={!current || busy} onClick={() => onPredict(historyId, current)}><Gauge size={16} />{busy ? "Predicting…" : "Predict final score"}</button>
          <div className="prediction-inline-note"><ShieldCheck size={15} />Published model: {model.publication.version}</div>
        </aside>

        <div className="prediction-sandbox-result">
          {!result ? (
            <div className="prediction-sandbox-empty"><FlaskConical size={28} /><h2>No sandbox result yet</h2><p>Choose a scenario and run a synthetic prediction.</p></div>
          ) : (
            <>
              <div className="prediction-score-result">
                <div><small>{result.scenarioLabel}</small><span>Predicted final score</span><strong>{result.predictedFinalScore}</strong><p>Expected range {result.expectedRange.minimum}–{result.expectedRange.maximum}</p></div>
                <div><span>{result.confidence}</span><strong>{result.method}</strong><small>Current verified score remains {result.currentVerifiedScore}</small></div>
              </div>
              <div className="prediction-result-panel">
                <h2>Contributing checkpoint factors</h2>
                <ul>{result.factors.map((factor) => <li key={factor}>{factor}</li>)}</ul>
              </div>
              <div className="prediction-result-panel">
                <h2>Versions and safeguards</h2>
                <dl className="prediction-metadata-list">
                  <div><dt>Model version</dt><dd>{result.versions.model || "Rule-based fallback"}</dd></div>
                  <div><dt>Policy version</dt><dd>{result.versions.policy}</dd></div>
                  <div><dt>Framework version</dt><dd>{result.versions.framework}</dd></div>
                  <div><dt>Predicted at</dt><dd>{new Date(result.predictedAt).toLocaleString()}</dd></div>
                  <div><dt>Range method</dt><dd>{result.expectedRange.method}</dd></div>
                  <div><dt>Official score changed</dt><dd>{result.officialScoreChanged ? "Yes" : "No"}</dd></div>
                </dl>
              </div>
              <div className="prediction-warning-list">{result.warnings.map((warning) => <div key={warning}><AlertTriangle size={15} /><span>{warning}</span></div>)}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
