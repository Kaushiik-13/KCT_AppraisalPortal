"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Database,
  FlaskConical,
  Layers3,
  LineChart,
  Rocket,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { rowsToCsv } from "./csv.js";
import DatasetPreview from "./DatasetPreview.jsx";
import ModelConfiguration from "./ModelConfiguration.jsx";
import ModelApprovalPanel from "./ModelApprovalPanel.jsx";
import ModelPublication from "./ModelPublication.jsx";
import ModelTrainingComparison from "./ModelTrainingComparison.jsx";
import PredictionSandbox from "./PredictionSandbox.jsx";
import PredictionOverview from "./PredictionOverview.jsx";
import SyntheticDatasetWizard from "./SyntheticDatasetWizard.jsx";

const INITIAL_CONFIGURATION = {
  seed: 20261029,
  activeCycleStartYear: 2026,
  activeEmployeeCount: 40,
  activeElapsedFraction: 0.33,
  limitedEmployees: 30,
  limitedCycleCount: 2,
  sufficientEmployees: 60,
  sufficientCycleCount: 4,
  checkpointCount: 4,
  includeInvalidCases: true,
  patternWeights: {
    steady: 22,
    early_fast: 12,
    late_improvement: 14,
    stalled: 10,
    irregular: 12,
    high_consistent: 12,
    low_consistent: 10,
    evidence_delayed: 8,
  },
};

const SCREENS = [
  { id: "overview", label: "Overview", description: "Status and next action", icon: BarChart3 },
  { id: "setup", label: "Dataset setup", description: "Eight generation decisions", icon: Settings2 },
  { id: "data", label: "Data & readiness", description: "Preview, filter and validate", icon: ShieldCheck },
  { id: "model", label: "Model configuration", description: "Features, split and candidates", icon: SlidersHorizontal },
  { id: "comparison", label: "Training results", description: "Held-out model comparison", icon: LineChart },
  { id: "evaluation", label: "Evaluation", description: "Approve or reject candidate", icon: CheckCircle2 },
  { id: "publication", label: "Publication", description: "Activate compatible model", icon: Rocket },
  { id: "sandbox", label: "Prediction sandbox", description: "Try read-only inference", icon: FlaskConical },
];

const INITIAL_MODEL_CONFIGURATION = {
  target: "final_approved_score",
  featureSelection: [],
  candidates: ["ridge", "random_forest", "gradient_boosting"],
  seed: 20261029,
};

function downloadText(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function readResponse(response) {
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || "The request could not be completed.");
    error.issues = result.issues || [];
    throw error;
  }
  return result;
}

export default function PredictionStudio({ organization, policy }) {
  const [screen, setScreen] = useState("overview");
  const [configuration, setConfiguration] = useState(INITIAL_CONFIGURATION);
  const [generated, setGenerated] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState("sufficient");
  const [readiness, setReadiness] = useState(null);
  const [busy, setBusy] = useState(false);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [dirty, setDirty] = useState(true);
  const [modelConfiguration, setModelConfiguration] = useState(INITIAL_MODEL_CONFIGURATION);
  const [trainingResult, setTrainingResult] = useState(null);
  const [trainingBusy, setTrainingBusy] = useState(false);
  const [governedModel, setGovernedModel] = useState(null);
  const [lifecycleBusy, setLifecycleBusy] = useState(false);
  const [predictionBusy, setPredictionBusy] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const readinessRequest = useRef(0);

  const estimatedRows = useMemo(() => (
    configuration.activeEmployeeCount
    + configuration.limitedEmployees * configuration.limitedCycleCount * configuration.checkpointCount
    + configuration.sufficientEmployees * configuration.sufficientCycleCount * configuration.checkpointCount
    + (configuration.includeInvalidCases ? 12 : 0)
  ), [configuration]);

  const updateConfiguration = (field, value) => {
    setConfiguration((previous) => ({ ...previous, [field]: value }));
    setDirty(true);
    setErrors([]);
  };

  const updatePattern = (pattern, value) => {
    setConfiguration((previous) => ({
      ...previous,
      patternWeights: { ...previous.patternWeights, [pattern]: value },
    }));
    setDirty(true);
    setErrors([]);
  };

  const runReadiness = async (generation, datasetId) => {
    const requestId = readinessRequest.current + 1;
    readinessRequest.current = requestId;
    const dataset = generation.datasets[datasetId];
    setReadinessLoading(true);
    setReadiness(null);
    try {
      const response = await fetch("/api/prediction/datasets/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot: {
            id: dataset.snapshotId,
            organizationId: generation.organization.id,
            policyVersion: generation.policy.version,
            frameworkVersion: generation.frameworkVersion,
            rows: dataset.rows,
          },
          policy: generation.policy,
          featureSelection: generation.defaultFeatureSelection,
        }),
      });
      const result = await readResponse(response);
      if (readinessRequest.current === requestId) setReadiness(result);
      return result;
    } catch (error) {
      if (readinessRequest.current === requestId) setErrors([error.message]);
      return null;
    } finally {
      if (readinessRequest.current === requestId) setReadinessLoading(false);
    }
  };

  const generate = async () => {
    setBusy(true);
    setErrors([]);
    try {
      const response = await fetch("/api/prediction/datasets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configuration }),
      });
      const result = await readResponse(response);
      setGenerated(result);
      setModelConfiguration({ ...INITIAL_MODEL_CONFIGURATION, featureSelection: result.defaultFeatureSelection });
      setTrainingResult(null);
      setGovernedModel(null);
      setPredictionResult(null);
      setSelectedDataset("sufficient");
      setDirty(false);
      setScreen("data");
      await runReadiness(result, "sufficient");
    } catch (error) {
      setErrors(error.issues?.length ? error.issues : [error.message]);
    } finally {
      setBusy(false);
    }
  };

  const selectDataset = async (datasetId) => {
    setSelectedDataset(datasetId);
    setTrainingResult(null);
    setGovernedModel(null);
    setPredictionResult(null);
    await runReadiness(generated, datasetId);
  };

  const updateModelConfiguration = (field, value) => {
    setModelConfiguration((previous) => ({ ...previous, [field]: value }));
    setTrainingResult(null);
    setGovernedModel(null);
    setPredictionResult(null);
    setErrors([]);
  };

  const toggleModelValue = (field, value) => {
    const values = modelConfiguration[field];
    updateModelConfiguration(field, values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const trainModels = async () => {
    const dataset = generated.datasets[selectedDataset];
    setTrainingBusy(true);
    setErrors([]);
    try {
      const response = await fetch("/api/prediction/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot: {
            id: dataset.snapshotId,
            organizationId: generated.organization.id,
            policyVersion: generated.policy.version,
            frameworkVersion: generated.frameworkVersion,
            rows: dataset.rows,
          },
          policy: generated.policy,
          configuration: modelConfiguration,
        }),
      });
      const result = await readResponse(response);
      setTrainingResult(result);
      setGovernedModel(null);
      setPredictionResult(null);
      setScreen("comparison");
    } catch (error) {
      setErrors(error.issues?.length ? error.issues : [error.message]);
    } finally {
      setTrainingBusy(false);
    }
  };

  const openEvaluation = () => {
    const candidate = trainingResult?.candidates.find((entry) => entry.id === trainingResult.recommendation.candidateId);
    const model = trainingResult?.models?.find((entry) => entry.id === candidate?.modelId);
    setGovernedModel(model || null);
    setErrors(model ? [] : ["The recommended candidate is not available in the local model registry."]);
    if (model) setScreen("evaluation");
  };

  const decideModel = async (decision, reviewer, note) => {
    setLifecycleBusy(true);
    setErrors([]);
    try {
      const response = await fetch(`/api/prediction/models/${governedModel.id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewer, note }),
      });
      const result = await readResponse(response);
      setGovernedModel(result.model);
    } catch (error) {
      setErrors(error.issues?.length ? error.issues : [error.message]);
    } finally {
      setLifecycleBusy(false);
    }
  };

  const publishModel = async () => {
    setLifecycleBusy(true);
    setErrors([]);
    try {
      const response = await fetch(`/api/prediction/models/${governedModel.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compatibility: {
            organizationId: governedModel.organizationId,
            target: governedModel.target,
            policyVersion: governedModel.compatibility.policyVersion,
            frameworkVersion: governedModel.compatibility.frameworkVersion,
          },
        }),
      });
      const result = await readResponse(response);
      setGovernedModel(result.model);
    } catch (error) {
      setErrors(error.issues?.length ? error.issues : [error.message]);
    } finally {
      setLifecycleBusy(false);
    }
  };

  const predict = async (historyId, currentRecord) => {
    const history = generated.datasets[historyId];
    setPredictionBusy(true);
    setPredictionResult(null);
    setErrors([]);
    try {
      const response = await fetch("/api/prediction/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historySnapshot: {
            id: history.snapshotId,
            organizationId: generated.organization.id,
            policyVersion: generated.policy.version,
            frameworkVersion: generated.frameworkVersion,
            rows: history.rows,
          },
          currentRecord,
          policy: generated.policy,
        }),
      });
      setPredictionResult(await readResponse(response));
    } catch (error) {
      setErrors(error.issues?.length ? error.issues : [error.message]);
    } finally {
      setPredictionBusy(false);
    }
  };

  const downloadCsv = () => {
    const dataset = generated.datasets[selectedDataset];
    downloadText(dataset.fileName, rowsToCsv(dataset.rows, generated.columns), "text/csv;charset=utf-8");
  };

  const downloadMetadata = () => {
    const datasets = Object.fromEntries(Object.entries(generated.datasets).map(([id, dataset]) => [id, {
      snapshotId: dataset.snapshotId,
      fileName: dataset.fileName,
      checksum: dataset.checksum,
      summary: dataset.summary,
    }]));
    downloadText(
      `${generated.snapshotGroupId}-metadata.json`,
      `${JSON.stringify({
        synthetic: true,
        snapshotGroupId: generated.snapshotGroupId,
        organization: generated.organization,
        policyVersion: generated.policy.version,
        generatorVersion: generated.generatorVersion,
        frameworkVersion: generated.frameworkVersion,
        configuration: generated.configuration,
        datasets,
      }, null, 2)}\n`,
      "application/json;charset=utf-8",
    );
  };

  return (
    <div className="prediction-shell">
      <aside className="prediction-sidebar">
        <a className="prediction-brand" href="/" aria-label="Back to Framework Studio">
          <span><Layers3 size={23} /></span>
          <div><strong>AFPI</strong><small>Prediction Framework</small></div>
        </a>
        <div className="prediction-sidebar-label">PROTOTYPE SCREENS</div>
        <nav aria-label="Prediction screens">
          {SCREENS.map((item, index) => {
            const Icon = item.icon;
            const disabled = (item.id === "data" && !generated)
              || (item.id === "model" && !readiness?.eligibility?.modelTraining)
              || (item.id === "comparison" && !trainingResult)
              || (item.id === "evaluation" && !trainingResult?.recommendation?.gatePassed)
              || (item.id === "publication" && !new Set(["approved", "published"]).has(governedModel?.lifecycle))
              || (item.id === "sandbox" && governedModel?.lifecycle !== "published");
            return (
              <button
                key={item.id}
                className={screen === item.id ? "active" : ""}
                onClick={() => setScreen(item.id)}
                disabled={disabled}
              >
                <Icon size={18} />
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
                <em>{String(index + 1).padStart(2, "0")}</em>
              </button>
            );
          })}
        </nav>
        <div className="prediction-sidebar-note">
          <Database size={18} />
          <div><strong>Synthetic data only</strong><p>No real employee records are used or saved.</p></div>
        </div>
      </aside>

      <main className="prediction-main">
        <header className="prediction-header">
          <div>
            <a href="/"><ArrowLeft size={16} />Framework Studio</a>
            <span>/</span>
            <strong>{SCREENS.find((item) => item.id === screen)?.label}</strong>
          </div>
          <div className="prediction-header-status">
            <span className={generated ? "ready" : ""} />
            {generated ? "Synthetic snapshot ready" : "Configuration not generated"}
          </div>
        </header>

        {screen === "overview" ? (
          <PredictionOverview
            organization={organization}
            policy={policy}
            generated={generated}
            readiness={readiness}
            trainingResult={trainingResult}
            governedModel={governedModel}
            onConfigure={() => setScreen("setup")}
            onOpenData={() => setScreen("data")}
            onOpenModel={() => setScreen("model")}
            onOpenComparison={() => setScreen("comparison")}
            onOpenGovernance={() => setScreen(governedModel?.lifecycle === "published" ? "sandbox" : governedModel?.lifecycle === "approved" ? "publication" : "evaluation")}
          />
        ) : screen === "setup" ? (
          <SyntheticDatasetWizard
            configuration={configuration}
            estimatedRows={estimatedRows}
            busy={busy}
            dirty={dirty}
            errors={errors}
            onChange={updateConfiguration}
            onPatternChange={updatePattern}
            onGenerate={generate}
          />
        ) : screen === "data" && generated ? (
          <DatasetPreview
            key={selectedDataset}
            generated={generated}
            selectedDataset={selectedDataset}
            readiness={readiness}
            readinessLoading={readinessLoading}
            onSelectDataset={selectDataset}
            onDownloadCsv={downloadCsv}
            onDownloadMetadata={downloadMetadata}
            onConfigure={() => setScreen("setup")}
            onConfigureModel={() => setScreen("model")}
          />
        ) : screen === "model" && generated ? (
          <ModelConfiguration
            generated={generated}
            selectedDataset={selectedDataset}
            readiness={readiness}
            configuration={modelConfiguration}
            busy={trainingBusy}
            errors={errors}
            onFeatureToggle={(field) => toggleModelValue("featureSelection", field)}
            onCandidateToggle={(candidate) => toggleModelValue("candidates", candidate)}
            onSeedChange={(value) => updateModelConfiguration("seed", value)}
            onTrain={trainModels}
            onBack={() => setScreen("data")}
          />
        ) : screen === "comparison" && trainingResult ? (
          <ModelTrainingComparison
            result={trainingResult}
            onReconfigure={() => setScreen("model")}
            onRunAgain={trainModels}
            onEvaluate={openEvaluation}
          />
        ) : screen === "evaluation" && trainingResult && governedModel ? (
          <ModelApprovalPanel
            result={trainingResult}
            model={governedModel}
            busy={lifecycleBusy}
            errors={errors}
            onDecision={decideModel}
            onBack={() => setScreen("comparison")}
            onContinue={() => setScreen("publication")}
          />
        ) : screen === "publication" && governedModel ? (
          <ModelPublication
            model={governedModel}
            busy={lifecycleBusy}
            errors={errors}
            onPublish={publishModel}
            onBack={() => setScreen("evaluation")}
            onOpenSandbox={() => setScreen("sandbox")}
          />
        ) : screen === "sandbox" && governedModel?.lifecycle === "published" ? (
          <PredictionSandbox
            generated={generated}
            model={governedModel}
            busy={predictionBusy}
            errors={errors}
            result={predictionResult}
            onPredict={predict}
            onReset={() => { setPredictionResult(null); setErrors([]); }}
            onBack={() => setScreen("publication")}
          />
        ) : null}
      </main>
    </div>
  );
}
