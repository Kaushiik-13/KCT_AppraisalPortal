import { CheckCircle2, LockKeyhole, Rocket, ShieldCheck } from "lucide-react";

export default function ModelPublication({ model, busy, errors, onPublish, onBack, onOpenSandbox }) {
  const published = model?.lifecycle === "published";
  return (
    <section className="prediction-page-section" aria-labelledby="model-publication-title">
      <div className="prediction-section-heading">
        <div><span className="prediction-kicker">SCREEN 7 · PUBLISH MODEL</span><h1 id="model-publication-title">Activate only the approved compatible model.</h1><p>Publication creates immutable prototype version metadata. A later compatible publication supersedes this version without deleting it.</p></div>
        <button className="prediction-btn" onClick={onBack}>Back to evaluation</button>
      </div>

      <div className={`prediction-publication-hero ${published ? "published" : "approved"}`}>
        <span>{published ? <Rocket size={25} /> : <LockKeyhole size={25} />}</span>
        <div><small>{published ? "ACTIVE PROTOTYPE MODEL" : "APPROVED · NOT ACTIVE"}</small><h2>{published ? model.publication.version : model.algorithm.label}</h2><p>{published ? `Published ${new Date(model.publication.publishedAt).toLocaleString()}` : "Explicit publication is still required before model-based prediction."}</p></div>
        <strong>{model.lifecycle}</strong>
      </div>

      {errors.length ? <div className="prediction-alert danger" role="alert"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}

      <div className="prediction-publication-grid">
        <article className="prediction-model-card">
          <h2>Publication guard</h2>
          <div className="prediction-guard-list">
            <div><CheckCircle2 size={17} /><span><strong>Candidate gate passed</strong><small>Held-out MAE beat both transparent baselines.</small></span></div>
            <div><CheckCircle2 size={17} /><span><strong>Administrator approval recorded</strong><small>{model.approval.reviewer} · {model.approval.note}</small></span></div>
            <div><CheckCircle2 size={17} /><span><strong>Compatibility fixed</strong><small>{model.organizationId} · {model.compatibility.policyVersion} · {model.compatibility.frameworkVersion}</small></span></div>
            <div><ShieldCheck size={17} /><span><strong>Read-only prediction boundary</strong><small>Inference cannot mutate verified evidence or the official score.</small></span></div>
          </div>
        </article>
        <article className="prediction-model-card">
          <h2>Version record</h2>
          <dl className="prediction-metadata-list">
            <div><dt>Model ID</dt><dd>{model.id}</dd></div>
            <div><dt>Algorithm</dt><dd>{model.algorithm.label}</dd></div>
            <div><dt>Target</dt><dd>{model.target}</dd></div>
            <div><dt>Dataset checksum</dt><dd>{model.dataset.checksum}</dd></div>
            <div><dt>Configuration checksum</dt><dd>{model.configurationChecksum}</dd></div>
            <div><dt>Supersedes</dt><dd>{model.publication?.supersedesModelId || "None"}</dd></div>
          </dl>
        </article>
      </div>

      <div className="prediction-sticky-action">
        <div><strong>{published ? "Model is active for its exact compatibility scope" : "Ready for explicit publication"}</strong><span>Synthetic local registry only · not durable or production-authorized</span></div>
        {published
          ? <button className="prediction-btn primary" onClick={onOpenSandbox}>Open prediction sandbox</button>
          : <button className="prediction-btn primary" disabled={busy} onClick={onPublish}><Rocket size={16} />{busy ? "Publishing…" : "Publish model"}</button>}
      </div>
    </section>
  );
}
