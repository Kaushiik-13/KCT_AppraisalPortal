import { AlertTriangle, CheckCircle2, RotateCcw, Trophy } from "lucide-react";

const metric = (value, digits = 2) => Number.isFinite(value) ? Number(value).toFixed(digits) : "—";
const parameters = (value) => Object.entries(value || {}).map(([key, item]) => `${key.replaceAll("_", " ")}: ${Array.isArray(item) ? item.join("–") : item}`).join(" · ");

export default function ModelTrainingComparison({ result, onReconfigure, onRunAgain, onEvaluate }) {
  const rows = [...result.baselines.map((entry) => ({ ...entry, kind: "Baseline" })), ...result.candidates.map((entry) => ({ ...entry, kind: "Candidate" }))];
  const scoreRange = result.scoreRange || { minimum: 0, maximum: 200 };
  const recommended = result.recommendation.gatePassed
    ? rows.find((entry) => entry.id === result.recommendation.candidateId)
    : null;
  const recommendedModel = result.models?.find((entry) => entry.id === recommended?.modelId);

  return (
    <section className="prediction-page-section" aria-labelledby="model-comparison-title">
      <div className="prediction-section-heading">
        <div>
          <span className="prediction-kicker">SCREEN 5 · TRAINING AND COMPARISON</span>
          <h1 id="model-comparison-title">Held-out model comparison is complete.</h1>
          <p>Every result below uses earlier completed cycles for training and the latest completed cycle for testing.</p>
        </div>
        <div className="prediction-action-row">
          <button className="prediction-btn" onClick={onReconfigure}>Change configuration</button>
          <button className="prediction-btn" onClick={onRunAgain}><RotateCcw size={15} />Run again</button>
          {recommended?.modelId ? <button className="prediction-btn primary" onClick={onEvaluate}>{recommendedModel?.lifecycle === "candidate" ? "Evaluate candidate" : "View candidate"}</button> : null}
        </div>
      </div>

      <div className={`prediction-recommendation ${recommended ? "passed" : "not-passed"}`}>
        <span>{recommended ? <Trophy size={24} /> : <AlertTriangle size={24} />}</span>
        <div>
          <small>RECOMMENDATION GATE</small>
          <h2>{recommended ? `${recommended.label} passed` : "No candidate passed"}</h2>
          <p>{result.recommendation.reason}</p>
        </div>
        <strong>{recommended ? `MAE ${metric(recommended.metrics.mae)}` : "Use a transparent baseline"}</strong>
      </div>

      <div className="prediction-run-summary">
        <div><span>Run</span><strong>{result.runId}</strong></div>
        <div><span>Provider</span><strong>{result.provider.library}</strong></div>
        <div><span>Train rows</span><strong>{result.split.trainRows}</strong></div>
        <div><span>Test rows</span><strong>{result.split.testRows}</strong></div>
        <div><span>Seed</span><strong>{result.provider.seed}</strong></div>
        <div><span>Target range</span><strong>{scoreRange.minimum}–{scoreRange.maximum}</strong></div>
      </div>

      <div className="prediction-comparison-card">
        <div className="prediction-comparison-scroll">
          <table>
            <thead><tr><th>Method</th><th>Status</th><th>MAE ↓</th><th>RMSE ↓</th><th>nMAE ↓</th><th>R² ↑</th><th>Expected range</th><th>Parameters</th></tr></thead>
            <tbody>
              {rows.map((row) => {
                const isRecommended = recommended?.id === row.id;
                return (
                  <tr key={row.id} className={isRecommended ? "recommended" : ""}>
                    <td><strong>{row.label}</strong><small>{row.kind}{isRecommended ? " · recommended" : ""}</small></td>
                    <td><span className={`prediction-status-pill ${row.status === "succeeded" ? "success" : "danger"}`}>{row.status}</span></td>
                    <td>{metric(row.metrics?.mae)}</td>
                    <td>{metric(row.metrics?.rmse)}</td>
                    <td>{metric(row.metrics?.normalizedMae, 3)}</td>
                    <td>{metric(row.metrics?.rSquared, 3)}</td>
                    <td>{row.metrics ? <><strong>±{metric(row.metrics.expectedRange.radius)}</strong><small>{metric(row.metrics.expectedRange.empiricalCoverage * 100, 1)}% held-out coverage</small></> : "—"}</td>
                    <td><small>{parameters(row.parameters)}</small></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="prediction-result-notes">
        <div><CheckCircle2 size={17} /><span><strong>Leakage controls applied</strong><small>Train-only preprocessing, no target/generator fields, no employee-cycle overlap.</small></span></div>
        <div><CheckCircle2 size={17} /><span><strong>Reproducible comparison</strong><small>Snapshot, configuration checksum, fixed seed, and parameters are recorded.</small></span></div>
        <div><AlertTriangle size={17} /><span><strong>Synthetic evidence only</strong><small>These scores do not represent production accuracy or authorize model approval.</small></span></div>
      </div>
    </section>
  );
}
