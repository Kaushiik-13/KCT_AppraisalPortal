import {
  ArrowRight,
  BarChart3,
  Database,
  Gauge,
  ShieldCheck,
} from "lucide-react";

function SummaryCard({ icon: Icon, label, value, detail, tone = "default" }) {
  return (
    <article className={`prediction-summary-card tone-${tone}`}>
      <span className="prediction-summary-icon"><Icon size={20} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

export default function PredictionOverview({ organization, policy, generated, readiness, trainingResult, onConfigure, onOpenData, onOpenModel, onOpenComparison }) {
  const datasetCount = generated ? Object.keys(generated.datasets).length : 0;
  const nextAction = !generated
    ? "Configure synthetic data"
    : readiness?.status === "blocked"
      ? "Resolve readiness blockers"
      : trainingResult
        ? "Review model comparison"
        : readiness?.eligibility?.modelTraining
          ? "Configure model training"
          : "Review generated data";
  return (
    <section className="prediction-page-section" aria-labelledby="prediction-overview-title">
      <div className="prediction-hero">
        <div>
          <span className="prediction-kicker">PREDICTION FRAMEWORK</span>
          <h1 id="prediction-overview-title">Prepare trustworthy data before training a model.</h1>
          <p>
            Configure synthetic appraisal history, inspect every scenario, and run the shared
            readiness gate. This prototype never uses real faculty records.
          </p>
          <div className="prediction-hero-actions">
            <button className="prediction-btn primary" onClick={onConfigure}>
              {generated ? "Edit dataset setup" : "Configure synthetic data"}
              <ArrowRight size={16} />
            </button>
            {generated ? (
              <button className="prediction-btn" onClick={onOpenData}>Open data and readiness</button>
            ) : null}
            {readiness?.eligibility?.modelTraining ? <button className="prediction-btn" onClick={onOpenModel}>Configure model</button> : null}
            {trainingResult ? <button className="prediction-btn" onClick={onOpenComparison}>Open comparison</button> : null}
          </div>
        </div>
        <div className="prediction-flow-card" aria-label="Prototype flow">
          <span>Current prototype flow</span>
          <ol>
            <li className="done"><i />PADS configuration</li>
            <li className={generated ? "done" : "active"}><i />Synthetic datasets</li>
            <li className={readiness ? "done" : generated ? "active" : ""}><i />Readiness gate</li>
            <li className={trainingResult ? "done" : readiness?.eligibility?.modelTraining ? "active" : ""}><i />Model training</li>
          </ol>
        </div>
      </div>

      <div className="prediction-summary-grid">
        <SummaryCard
          icon={Database}
          label="Organization"
          value={organization.displayName}
          detail="Synthetic-only tenant context"
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Policy version"
          value={policy.version}
          detail={policy.status.replaceAll("-", " ")}
        />
        <SummaryCard
          icon={BarChart3}
          label="Prediction target"
          value="Final overall score"
          detail="Organization-configured range: 0–200"
        />
        <SummaryCard
          icon={Database}
          label="Dataset status"
          value={generated ? `${datasetCount} scenarios generated` : "Not generated"}
          detail={generated ? generated.snapshotGroupId : "Complete the eight setup decisions"}
          tone={generated ? "success" : "default"}
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Readiness"
          value={readiness ? readiness.scenarioLabel : "Not checked"}
          detail={readiness ? readiness.methodLabel : "Runs after dataset generation"}
          tone={readiness?.status === "blocked" ? "danger" : readiness ? "success" : "default"}
        />
        <SummaryCard
          icon={Gauge}
          label="Next action"
          value={nextAction}
          detail={trainingResult ? "Held-out metrics are ready to review" : "Proceed only when the readiness gate allows training"}
        />
      </div>

      <div className="prediction-boundary-note">
        <ShieldCheck size={19} />
        <div>
          <strong>Synthetic demonstration only</strong>
          <p>Readiness confirms software contracts. It does not prove real KCT accuracy or approve a model.</p>
        </div>
      </div>
    </section>
  );
}
