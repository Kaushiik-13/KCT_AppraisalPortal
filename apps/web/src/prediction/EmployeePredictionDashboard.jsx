import { AlertTriangle, Clock3, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { buildKraProgress, predictionIsFresh } from "./employeePrediction.js";

const roleLabel = (roleCode) => roleCode.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function EmployeePredictionDashboard({
  organization,
  policy,
  model,
  context,
  result,
  busy,
  errors,
  onRefresh,
  onBack,
  onOpenRetraining,
}) {
  const current = context.currentRecord;
  const kraProgress = buildKraProgress(current, policy);
  const fresh = predictionIsFresh(result, current, policy.version);
  const canAdvance = Number(current.elapsed_fraction) < 0.9 && Number(current.current_overall_score) < Number(policy.overallScoreCap);

  return (
    <section className="prediction-page-section" aria-labelledby="employee-prediction-title">
      <div className="prediction-section-heading">
        <div><span className="prediction-kicker">SCREEN 9 · EMPLOYEE PREDICTION VIEW</span><h1 id="employee-prediction-title">Your current appraisal prediction.</h1><p>This simulated employee view contains only the selected synthetic employee. It has no model administration or access to another employee's records.</p></div>
        <div className="prediction-action-row"><button className="prediction-btn" onClick={onBack}>Back to sandbox</button><button className="prediction-btn" onClick={onOpenRetraining}>Retraining settings</button></div>
      </div>

      <div className="prediction-employee-session">
        <span><UserRound size={21} /></span>
        <div><small>SIMULATED EMPLOYEE SESSION</small><strong>{current.employee_key}</strong><p>{roleLabel(current.role_code)} · {organization.displayName} · Active cycle {current.cycle_id}</p></div>
        <em className={fresh ? "fresh" : "stale"}>{fresh ? "Prediction current" : "Refresh required"}</em>
      </div>

      {errors.length ? <div className="prediction-alert danger" role="alert"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}

      <div className="prediction-employee-score-grid">
        <article><span>Current verified score</span><strong>{current.current_overall_score}<small> / {policy.overallScoreCap}</small></strong><p>The deterministic score remains official.</p></article>
        <article className="prediction-employee-predicted"><span>Predicted final score</span><strong>{result.predictedFinalScore}</strong><p>Expected range {result.expectedRange.minimum}–{result.expectedRange.maximum}</p></article>
        <article><span>Cycle progress</span><strong>{Math.round(current.elapsed_fraction * 100)}%</strong><p>{current.remaining_days} days remaining</p></article>
        <article><span>Method and confidence</span><strong>{result.confidence}</strong><p>{result.method}</p></article>
      </div>

      <div className="prediction-employee-layout">
        <div className="prediction-model-column">
          <article className="prediction-model-card">
            <div className="prediction-model-card-heading"><ShieldCheck size={19} /><div><h2>Verified KRA progress</h2><p>Configured PADS KRA names and role caps are read from policy data.</p></div></div>
            <div className="prediction-kra-progress">
              {kraProgress.map((kra) => (
                <div key={kra.id}>
                  <span><strong>{kra.name}</strong><small>{kra.score} / {kra.cap}</small></span>
                  <progress max="100" value={kra.percent} aria-label={`${kra.name} progress ${kra.percent}%`} />
                </div>
              ))}
            </div>
          </article>

          <article className="prediction-model-card">
            <h2>Why this estimate moved</h2>
            <ul className="prediction-employee-factors">{result.factors.map((factor) => <li key={factor}>{factor}</li>)}</ul>
          </article>
        </div>

        <div className="prediction-model-column">
          <article className="prediction-model-card">
            <div className="prediction-model-card-heading"><Clock3 size={19} /><div><h2>Version and refresh details</h2><p>Dashboard access runs inference only. It never trains or publishes a model.</p></div></div>
            <dl className="prediction-metadata-list">
              <div><dt>Prediction path</dt><dd>{result.scenarioLabel}</dd></div>
              <div><dt>Prediction model</dt><dd>{result.versions.model || "Rule-based path"}</dd></div>
              <div><dt>Active organization model</dt><dd>{model.publication.version}</dd></div>
              <div><dt>Training run unchanged</dt><dd>{model.runId}</dd></div>
              <div><dt>Policy / framework</dt><dd>{result.versions.policy} / {result.versions.framework}</dd></div>
              <div><dt>Last calculated</dt><dd>{new Date(result.predictedAt).toLocaleString()}</dd></div>
              <div><dt>Verified refreshes</dt><dd>{context.refreshCount}</dd></div>
              <div><dt>Official score changed</dt><dd>{result.officialScoreChanged ? "Yes" : "No"}</dd></div>
            </dl>
            <button className="prediction-btn primary prediction-full-button" disabled={busy || !canAdvance} onClick={onRefresh}><RefreshCw size={16} className={busy ? "spin" : ""} />{busy ? "Refreshing inference…" : canAdvance ? "Load newer verified progress" : "Latest available progress loaded"}</button>
            <p className="prediction-card-help">This creates a later synthetic verified checkpoint and calls prediction again with the same published model. It does not add a training label.</p>
          </article>

          <article className="prediction-employee-warning-card">
            <AlertTriangle size={19} />
            <div><strong>Advisory prediction—not an appraisal result</strong><ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>
          </article>
        </div>
      </div>
    </section>
  );
}
