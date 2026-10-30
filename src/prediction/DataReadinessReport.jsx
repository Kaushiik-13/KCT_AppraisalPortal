import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";

function FindingList({ title, findings, tone }) {
  if (!findings?.length) return null;
  return (
    <div className={`prediction-findings ${tone}`}>
      <strong>{title}</strong>
      <ul>
        {findings.map((finding) => (
          <li key={finding.code}>
            <span>{finding.code.replaceAll("_", " ")}</span>
            <p>{finding.message}</p>
            {finding.count ? <small>{finding.count} affected row{finding.count === 1 ? "" : "s"}</small> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DataReadinessReport({ readiness, loading }) {
  if (loading) {
    return <section className="prediction-readiness-card loading" aria-live="polite"><Clock3 size={20} />Running shared readiness checks…</section>;
  }
  if (!readiness) {
    return <section className="prediction-readiness-card empty"><ShieldAlert size={21} /><div><strong>Readiness not run</strong><p>Generate a dataset and select a scenario.</p></div></section>;
  }
  const blocked = readiness.status === "blocked" || readiness.status === "fallback-only";
  return (
    <section className={`prediction-readiness-card ${blocked ? "blocked" : "ready"}`} aria-labelledby="readiness-result-title">
      <div className="prediction-readiness-heading">
        <span>{blocked ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}</span>
        <div>
          <small>READINESS RESULT</small>
          <h2 id="readiness-result-title">{readiness.scenario ? `Scenario ${readiness.scenario} · ${readiness.scenarioLabel}` : "Blocked"}</h2>
          <p>{readiness.methodLabel} · {readiness.profile.label}</p>
        </div>
        <span className={`prediction-status-pill ${blocked ? "danger" : "success"}`}>{readiness.status.replaceAll("-", " ")}</span>
      </div>

      <div className="prediction-readiness-metrics">
        <div><span>Usable rows</span><strong>{readiness.counts.validRows}</strong></div>
        <div><span>Rejected rows</span><strong>{readiness.counts.rejectedRows}</strong></div>
        <div><span>Completed cases</span><strong>{readiness.counts.completedCases}</strong></div>
        <div><span>Completed cycles</span><strong>{readiness.counts.completedCycles}</strong></div>
      </div>

      {readiness.split ? (
        <div className="prediction-split-summary">
          <div><span>Train cycles</span><strong>{readiness.split.trainCycleIds.join(", ")}</strong><small>{readiness.split.trainCases} employee-cycles</small></div>
          <div className="prediction-split-arrow">→</div>
          <div><span>Test cycle</span><strong>{readiness.split.testCycleIds.join(", ")}</strong><small>{readiness.split.testCases} employee-cycles</small></div>
        </div>
      ) : null}

      <div className="prediction-eligibility-grid">
        <div className={readiness.eligibility.ruleBasedEstimate ? "eligible" : "not-eligible"}>
          <span>Rule-based estimate</span><strong>{readiness.eligibility.ruleBasedEstimate ? "Available" : "Unavailable"}</strong>
        </div>
        <div className={readiness.eligibility.modelTraining ? "eligible" : "not-eligible"}>
          <span>Model training</span><strong>{readiness.eligibility.modelTraining ? "Eligible" : "Blocked"}</strong>
        </div>
      </div>

      <FindingList title="Blocking findings" findings={readiness.blocks} tone="danger" />
      <FindingList title="Warnings" findings={readiness.warnings} tone="warning" />
    </section>
  );
}
