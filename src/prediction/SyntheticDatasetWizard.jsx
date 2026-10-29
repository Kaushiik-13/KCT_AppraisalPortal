import { Check, Database, Info, RefreshCw } from "lucide-react";

const PATTERNS = [
  ["steady", "Steady"],
  ["early_fast", "Early fast"],
  ["late_improvement", "Late improvement"],
  ["stalled", "Stalled"],
  ["irregular", "Irregular"],
  ["high_consistent", "High consistent"],
  ["low_consistent", "Low consistent"],
  ["evidence_delayed", "Evidence delayed"],
];

function DecisionCard({ number, title, description, children, complete = true }) {
  return (
    <section className="prediction-decision-card">
      <div className="prediction-decision-heading">
        <span>{String(number).padStart(2, "0")}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {complete ? <Check size={17} aria-label="Configured" /> : null}
      </div>
      <div className="prediction-decision-body">{children}</div>
    </section>
  );
}

function NumberField({ label, value, min, max, step = 1, help, onChange }) {
  return (
    <label className="prediction-field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {help ? <small>{help}</small> : null}
    </label>
  );
}

export default function SyntheticDatasetWizard({
  configuration,
  estimatedRows,
  busy,
  dirty,
  errors,
  onChange,
  onPatternChange,
  onGenerate,
}) {
  return (
    <section className="prediction-page-section" aria-labelledby="dataset-setup-title">
      <div className="prediction-section-heading">
        <div>
          <span className="prediction-kicker">SCREEN 2 · SYNTHETIC DATASET SETUP</span>
          <h1 id="dataset-setup-title">Make the eight dataset decisions.</h1>
          <p>Organization-specific values stay in configuration. The generator remains reusable.</p>
        </div>
        <div className="prediction-estimate">
          <Database size={18} />
          <span><strong>{estimatedRows.toLocaleString()}</strong> expected rows</span>
        </div>
      </div>

      {errors.length ? (
        <div className="prediction-alert danger" role="alert">
          <strong>Check these settings</strong>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}

      <div className="prediction-decision-list">
        <DecisionCard number={1} title="Prediction target" description="Choose what the framework should estimate.">
          <div className="prediction-locked-value">
            <strong>Final approved overall appraisal score</strong>
            <span>Range 0–200 · Target only · Never used as an input feature</span>
          </div>
        </DecisionCard>

        <DecisionCard number={2} title="Data unit" description="Define what one training row represents.">
          <div className="prediction-locked-value">
            <strong>One employee + one appraisal cycle + one checkpoint</strong>
            <span>Each completed cycle repeats the final score as a target for retrospective checkpoint rows.</span>
          </div>
        </DecisionCard>

        <DecisionCard number={3} title="Input fields" description="Use only information available at the selected checkpoint.">
          <div className="prediction-chip-list">
            {[
              "Role",
              "Checkpoint",
              "Time remaining",
              "Current score",
              "Previous score",
              "Score change",
              "Evidence count",
              "Mandatory status",
              "KRA scores and caps",
            ].map((field) => <span key={field}>{field}</span>)}
          </div>
          <p className="prediction-inline-note"><Info size={15} />Final score, identities, future checkpoints and generator labels are automatically excluded.</p>
        </DecisionCard>

        <DecisionCard number={4} title="Performance patterns" description="Set the relative mix of synthetic progress behaviors.">
          <div className="prediction-pattern-grid">
            {PATTERNS.map(([id, label]) => (
              <NumberField
                key={id}
                label={label}
                value={configuration.patternWeights[id]}
                min={0}
                max={100}
                help="Relative weight"
                onChange={(value) => onPatternChange(id, value)}
              />
            ))}
          </div>
        </DecisionCard>

        <DecisionCard number={5} title="History scenarios" description="Generate every readiness path for the demonstration.">
          <div className="prediction-scenario-list">
            <div><strong>A · No history</strong><span>Active snapshots only; rule-based estimate.</span></div>
            <div><strong>B · Limited history</strong><span>Small completed history; low-confidence training gate.</span></div>
            <div><strong>C · Sufficient history</strong><span>Multiple completed cycles; latest cycle held out.</span></div>
            <div><strong>Invalid history</strong><span>Controlled defects; expected to block readiness.</span></div>
          </div>
        </DecisionCard>

        <DecisionCard number={6} title="Dataset size and timing" description="Choose reproducible prototype volumes and checkpoints.">
          <div className="prediction-field-grid">
            <NumberField label="Seed" value={configuration.seed} min={1} max={4294967295} onChange={(value) => onChange("seed", value)} help="Same seed and settings produce the same rows." />
            <NumberField label="Active cycle start year" value={configuration.activeCycleStartYear} min={2020} max={2100} onChange={(value) => onChange("activeCycleStartYear", value)} />
            <NumberField label="Current progress" value={configuration.activeElapsedFraction} min={0.05} max={0.95} step={0.01} onChange={(value) => onChange("activeElapsedFraction", value)} help="0.33 means 33% of the cycle has elapsed." />
            <NumberField label="Checkpoints per cycle" value={configuration.checkpointCount} min={2} max={6} onChange={(value) => onChange("checkpointCount", value)} />
            <NumberField label="Active employees" value={configuration.activeEmployeeCount} min={1} max={200} onChange={(value) => onChange("activeEmployeeCount", value)} />
            <NumberField label="Limited-history employees" value={configuration.limitedEmployees} min={1} max={200} onChange={(value) => onChange("limitedEmployees", value)} />
            <NumberField label="Limited-history cycles" value={configuration.limitedCycleCount} min={2} max={5} onChange={(value) => onChange("limitedCycleCount", value)} />
            <NumberField label="Sufficient-history employees" value={configuration.sufficientEmployees} min={1} max={500} onChange={(value) => onChange("sufficientEmployees", value)} />
            <NumberField label="Sufficient-history cycles" value={configuration.sufficientCycleCount} min={2} max={8} onChange={(value) => onChange("sufficientCycleCount", value)} />
          </div>
        </DecisionCard>

        <DecisionCard number={7} title="Data-quality cases" description="Keep invalid copies separate from clean source fixtures.">
          <label className="prediction-checkbox-row">
            <input
              type="checkbox"
              checked={configuration.includeInvalidCases}
              onChange={(event) => onChange("includeInvalidCases", event.target.checked)}
            />
            <span><strong>Include controlled invalid rows</strong><small>Missing target, duplicates, bad ranges/dates, unknown role/policy, target leakage, decreasing score and false synthetic flag.</small></span>
          </label>
        </DecisionCard>

        <DecisionCard number={8} title="Train/test structure" description="Protect future information and employee-cycle grouping.">
          <div className="prediction-locked-value">
            <strong>Latest completed cycle is the test set</strong>
            <span>Earlier cycles train · employee-cycle groups never split · preprocessing fits on training data only</span>
          </div>
        </DecisionCard>
      </div>

      <div className="prediction-sticky-action">
        <div>
          <strong>{dirty ? "Settings changed" : "Configuration ready"}</strong>
          <span>{estimatedRows.toLocaleString()} rows across four synthetic scenarios</span>
        </div>
        <button className="prediction-btn primary" disabled={busy} onClick={onGenerate}>
          <RefreshCw size={16} className={busy ? "spin" : ""} />
          {busy ? "Generating…" : "Generate datasets"}
        </button>
      </div>
    </section>
  );
}
