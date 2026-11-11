import { AlertTriangle, CheckCircle2, LockKeyhole, Play, ShieldCheck } from "lucide-react";
import { TRAINING_CANDIDATES, TRANSPARENT_BASELINES } from "./trainingConfig.js";

const label = (field) => field.replaceAll("_", " ");

export default function ModelConfiguration({
  generated,
  selectedDataset,
  readiness,
  configuration,
  busy,
  errors,
  onFeatureToggle,
  onCandidateToggle,
  onSeedChange,
  onTrain,
  onBack,
}) {
  const dataset = generated.datasets[selectedDataset];
  const ready = readiness?.status === "ready-for-training" && readiness?.eligibility?.modelTraining;
  const selectedFeatures = new Set(configuration.featureSelection);
  const selectedCandidates = new Set(configuration.candidates);

  return (
    <section className="prediction-page-section" aria-labelledby="model-configuration-title">
      <div className="prediction-section-heading">
        <div>
          <span className="prediction-kicker">SCREEN 4 · MODEL CONFIGURATION</span>
          <h1 id="model-configuration-title">Choose safe inputs and established models.</h1>
          <p>The prediction target and time-based split are locked. You can choose checkpoint-safe inputs, candidate models, and the reproducibility seed.</p>
        </div>
        <button className="prediction-btn" onClick={onBack}>Back to readiness</button>
      </div>

      <div className="prediction-boundary-note">
        <ShieldCheck size={19} />
        <div><strong>Synthetic demonstration only</strong><p>This configuration tests software behavior. It does not establish real KCT prediction accuracy.</p></div>
      </div>

      {errors.length ? (
        <div className="prediction-alert danger" role="alert"><strong>Training could not start.</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>
      ) : null}

      <div className="prediction-model-layout">
        <div className="prediction-model-column">
          <article className="prediction-model-card">
            <div className="prediction-model-card-heading"><LockKeyhole size={18} /><div><h2>Locked prediction contract</h2><p>These values protect the prototype from target leakage and future-data leakage.</p></div></div>
            <dl className="prediction-contract-grid">
              <div><dt>Target</dt><dd>Final approved score</dd><small>final_approved_score · 0–{generated.policy.overallScoreCap}</small></div>
              <div><dt>Snapshot</dt><dd>{dataset.label}</dd><small>{dataset.snapshotId}</small></div>
              <div><dt>Training cycles</dt><dd>{readiness?.split?.trainCycleIds.join(", ") || "Unavailable"}</dd><small>{readiness?.split?.trainRows || 0} checkpoint rows</small></div>
              <div><dt>Held-out test cycle</dt><dd>{readiness?.split?.testCycleIds.join(", ") || "Unavailable"}</dd><small>{readiness?.split?.testRows || 0} checkpoint rows</small></div>
              <div><dt>Preprocessing</dt><dd>Fit on training data only</dd><small>The held-out cycle cannot influence imputation or scaling.</small></div>
              <div><dt>Group overlap</dt><dd>{readiness?.split?.employeeCycleOverlap ?? "—"}</dd><small>Employee-cycle groups crossing the split</small></div>
            </dl>
          </article>

          <fieldset className="prediction-model-card">
            <legend>Checkpoint-safe input features</legend>
            <p className="prediction-card-help">Only fields available at the selected checkpoint can be used. At least one is required.</p>
            <div className="prediction-feature-options">
              {readiness?.featureContract.allowed.map((field) => (
                <label key={field}>
                  <input type="checkbox" checked={selectedFeatures.has(field)} onChange={() => onFeatureToggle(field)} />
                  <span><strong>{label(field)}</strong><small>{field.startsWith("kra_") ? "Policy-defined KRA field" : "Checkpoint-safe field"}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="prediction-model-column">
          <fieldset className="prediction-model-card">
            <legend>Candidate models</legend>
            <p className="prediction-card-help">These are established scikit-learn algorithms. The framework compares them; it does not invent a new algorithm.</p>
            <div className="prediction-candidate-options">
              {TRAINING_CANDIDATES.map((candidate) => (
                <label key={candidate.id}>
                  <input type="checkbox" checked={selectedCandidates.has(candidate.id)} onChange={() => onCandidateToggle(candidate.id)} />
                  <span><strong>{candidate.label}</strong><small>{candidate.description}</small><code>{Object.entries(candidate.parameters).map(([key, value]) => `${key}=${value}`).join(" · ")}</code></span>
                </label>
              ))}
            </div>
          </fieldset>

          <article className="prediction-model-card">
            <h2>Transparent baselines</h2>
            <p className="prediction-card-help">A candidate is recommended only when its held-out MAE is lower than both baselines.</p>
            <div className="prediction-baseline-list">
              {TRANSPARENT_BASELINES.map((baseline) => <div key={baseline.id}><CheckCircle2 size={15} /><span><strong>{baseline.label}</strong><small>Always included in comparison</small></span></div>)}
            </div>
          </article>

          <article className="prediction-model-card">
            <label className="prediction-seed-field" htmlFor="model-training-seed"><strong>Reproducibility seed</strong><small>Using the same snapshot, settings, and seed should produce the same metrics.</small></label>
            <input id="model-training-seed" type="number" min="1" max="2147483647" step="1" value={configuration.seed} onChange={(event) => onSeedChange(event.target.value)} />
          </article>

          <article className="prediction-exclusion-card">
            <AlertTriangle size={18} />
            <div><strong>Always excluded</strong><p>Final target, target availability date, identities, cycle/split fields, active-cycle targets, generator metadata, and <code>generation_pattern</code>.</p></div>
          </article>
        </div>
      </div>

      <div className="prediction-sticky-action">
        <div><strong>{ready ? "Ready to compare models" : "Training is blocked"}</strong><span>{ready ? `${configuration.featureSelection.length} features · ${configuration.candidates.length} candidates · held-out latest cycle` : "Return to readiness and select an eligible frozen dataset."}</span></div>
        <button className="prediction-btn primary" disabled={!ready || busy || !configuration.featureSelection.length || !configuration.candidates.length} onClick={onTrain}>
          <Play size={16} />{busy ? "Training and comparing…" : "Train and compare"}
        </button>
      </div>
    </section>
  );
}
