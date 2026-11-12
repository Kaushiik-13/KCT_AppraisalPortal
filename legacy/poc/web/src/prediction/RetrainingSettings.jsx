import { CalendarClock, CheckCircle2, Clock3, Database, LockKeyhole, RefreshCw } from "lucide-react";

const statusLabel = (status) => status.replaceAll("-", " ");

export default function RetrainingSettings({
  model,
  settings,
  simulation,
  status,
  onSettingChange,
  onSimulationChange,
  onSimulateCycleClose,
  onCheck,
  onBack,
  onOpenEmployee,
}) {
  return (
    <section className="prediction-page-section" aria-labelledby="retraining-settings-title">
      <div className="prediction-section-heading">
        <div><span className="prediction-kicker">SCREEN 10 · RETRAINING SETTINGS</span><h1 id="retraining-settings-title">Control when new outcomes may create a candidate.</h1><p>Readiness checks may be manual, cycle-close, or periodic. Training and publication remain separate administrator actions.</p></div>
        <div className="prediction-action-row"><button className="prediction-btn" onClick={onBack}>Back to publication</button>{onOpenEmployee ? <button className="prediction-btn" onClick={onOpenEmployee}>Employee view</button> : null}</div>
      </div>

      <div className="prediction-retraining-hero">
        <span><LockKeyhole size={23} /></span>
        <div><small>ACTIVE MODEL REMAINS AVAILABLE</small><h2>{model.publication.version}</h2><p>{model.algorithm.label} · published {new Date(model.publication.publishedAt).toLocaleString()}</p></div>
        <strong>{model.lifecycle}</strong>
      </div>

      <div className="prediction-retraining-layout">
        <div className="prediction-model-column">
          <article className="prediction-model-card">
            <div className="prediction-model-card-heading"><CalendarClock size={19} /><div><h2>Readiness-check triggers</h2><p>Triggers start a check only. They never auto-publish a replacement.</p></div></div>
            <div className="prediction-retraining-options">
              <label><input type="checkbox" checked={settings.manualEnabled} onChange={(event) => onSettingChange("manualEnabled", event.target.checked)} /><span><strong>Manual readiness check</strong><small>An administrator may request a check at any time.</small></span></label>
              <label><input type="checkbox" checked={settings.cycleCloseEnabled} onChange={(event) => onSettingChange("cycleCloseEnabled", event.target.checked)} /><span><strong>After appraisal cycle closure</strong><small>Still waits for final approved outcomes and minimum data.</small></span></label>
              <label><input type="checkbox" checked={settings.periodicEnabled} onChange={(event) => onSettingChange("periodicEnabled", event.target.checked)} /><span><strong>Periodic readiness check</strong><small>Optional schedule; does not schedule model training.</small></span></label>
            </div>
            <div className="prediction-retraining-fields">
              <label><span>Periodic interval (days)</span><input type="number" min="1" max="365" disabled={!settings.periodicEnabled} value={settings.periodicDays} onChange={(event) => onSettingChange("periodicDays", Number(event.target.value))} /></label>
              <label><span>Minimum new approved cases</span><input type="number" min="1" max="10000" value={settings.minimumNewCompletedCases} onChange={(event) => onSettingChange("minimumNewCompletedCases", Number(event.target.value))} /></label>
              <label><span>Minimum completed-cycle coverage</span><input type="number" min="1" max="50" value={settings.minimumCompletedCycles} onChange={(event) => onSettingChange("minimumCompletedCycles", Number(event.target.value))} /></label>
            </div>
          </article>

          <article className="prediction-model-card">
            <div className="prediction-model-card-heading"><Database size={19} /><div><h2>Demonstrate new outcome availability</h2><p>Active-cycle checkpoints remain inference-only until closure and final approval.</p></div></div>
            <div className="prediction-cycle-state">
              <div><span>Cycle status</span><strong>{simulation.cycleClosed ? "Closed" : "Active"}</strong></div>
              <div><span>Final outcomes</span><strong>{simulation.finalScoresApproved ? "Approved" : "Unavailable"}</strong></div>
              <div><span>Usable new labels</span><strong>{status.usableNewCases}</strong></div>
            </div>
            {!simulation.cycleClosed ? <button className="prediction-btn prediction-full-button" onClick={onSimulateCycleClose}>Simulate appraisal-cycle closure</button> : null}
            <label className="prediction-retraining-approval"><input type="checkbox" disabled={!simulation.cycleClosed} checked={simulation.finalScoresApproved} onChange={(event) => onSimulationChange("finalScoresApproved", event.target.checked)} /><span><strong>Final overall scores approved</strong><small>Only then may captured checkpoints become labelled cases.</small></span></label>
            <div className="prediction-retraining-fields">
              <label><span>New completed cases</span><input type="number" min="0" disabled={!simulation.cycleClosed} value={simulation.newCompletedCases} onChange={(event) => onSimulationChange("newCompletedCases", Number(event.target.value))} /></label>
              <label><span>Completed-cycle coverage</span><input type="number" min="0" disabled={!simulation.cycleClosed} value={simulation.completedCycleCoverage} onChange={(event) => onSimulationChange("completedCycleCoverage", Number(event.target.value))} /></label>
            </div>
          </article>
        </div>

        <div className="prediction-model-column">
          <article className={`prediction-retraining-status ${status.candidateTrainingEligible ? "eligible" : "waiting"}`}>
            <span>{status.candidateTrainingEligible ? <CheckCircle2 size={24} /> : <Clock3 size={24} />}</span>
            <div><small>RETRAINING STATUS</small><h2>{statusLabel(status.status)}</h2><p>{status.nextAction}</p></div>
          </article>

          {status.errors.length ? <div className="prediction-alert danger" role="alert"><ul>{status.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}

          <article className="prediction-model-card">
            <h2>Next eligibility details</h2>
            <dl className="prediction-metadata-list">
              <div><dt>Missing approved cases</dt><dd>{status.missingCases}</dd></div>
              <div><dt>Missing cycle coverage</dt><dd>{status.missingCycles}</dd></div>
              <div><dt>Next periodic check</dt><dd>{status.nextPeriodicCheck ? new Date(status.nextPeriodicCheck).toLocaleString() : "Not enabled"}</dd></div>
              <div><dt>Last readiness check</dt><dd>{simulation.lastCheckedAt ? new Date(simulation.lastCheckedAt).toLocaleString() : "Not run"}</dd></div>
              <div><dt>Candidate training</dt><dd>{status.candidateTrainingEligible ? "May be requested" : "Not yet eligible"}</dd></div>
              <div><dt>Automatic publication</dt><dd>Never</dd></div>
            </dl>
            <button className="prediction-btn primary prediction-full-button" disabled={status.errors.length > 0} onClick={onCheck}><RefreshCw size={16} />Run readiness check</button>
            <p className="prediction-card-help">This records a simulated check only. It does not train a candidate, change the active model, or publish anything.</p>
          </article>

          <article className="prediction-model-card">
            <h2>Locked replacement safeguards</h2>
            <div className="prediction-guard-list">
              <div><CheckCircle2 size={17} /><span><strong>Current model remains active</strong><small>{settings.keepPublishedModelActive ? "Required while a candidate is trained and evaluated." : "Configuration error"}</small></span></div>
              <div><CheckCircle2 size={17} /><span><strong>Evaluation remains required</strong><small>A new candidate must beat the configured comparison gates.</small></span></div>
              <div><CheckCircle2 size={17} /><span><strong>Administrator approval remains required</strong><small>{settings.approvalRequired ? "Publication is always explicit." : "Configuration error"}</small></span></div>
            </div>
          </article>

          <article className="prediction-model-card prediction-monitoring-card">
            <h2>Prototype monitoring</h2>
            <p>Model age and supported compatibility are visible. Real outcome error, drift, failure rate, alerts, rollback and automated jobs require durable production telemetry and remain deferred.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
