# Architecture

## Runtime boundaries

```mermaid
flowchart LR
  Creator[Creator UI] --> Draft[Draft configuration]
  Draft --> Storage[(Browser localStorage)]
  Draft --> Engine[Browser workflow engine]
  Form[Test submission] --> Engine
  Evidence[Local PDF / PPTX / XLS / XLSX] --> Extract[Format adapters]
  Extract --> Engine
  Engine --> Crossref[Crossref API]
  Engine --> NextAPI[Next.js route handler]
  NextAPI --> OpenRouter[OpenRouter free router]
  Engine --> Review[Session review pause]
  Review --> Engine
  Engine --> Result[Trace and result]
  Policy[Selected policy version] --> Engine
```

Next.js App Router serves the application. `app/studio-client.jsx` loads the existing studio as a client-only boundary because workflow state, localStorage, file inputs and PDF.js are browser-owned. The workflow engine still runs in the browser. Node route handlers expose only the AI status and assistance endpoints; Crossref is called directly from the browser.

## Source map

| Area | Files | Responsibility |
|---|---|---|
| App entry | `app/layout.jsx`, `app/page.jsx`, `app/studio-client.jsx`, `app/globals.css` | App Router shell, metadata, client boundary, global styles |
| Shell and forms | `src/main.jsx`, `src/style.css` | Navigation, inputs, preview, sidebar |
| Draft lifecycle | `src/useDraft.js`, `src/draftStorage.js` | Autosave, recovery, reset |
| Workflow UI | `src/WorkflowStudio.jsx`, `src/TreeBuilder.jsx`, `src/treeModel.js` | Canvas, edits, test orchestration |
| Settings | `src/BlockSettings.jsx`, `src/NodeSettings.jsx` | Generic blocks and tool configuration |
| Definitions | `src/workflowModel.js` | Ports, defaults, mappings, publication example |
| Execution | `src/workflowEngine.js` | Validation, handlers, traversal, reviews |
| Evidence adapters | `src/documentReader.js`, `src/pdfReader.js` | Local PDF, presentation and spreadsheet extraction |
| Results | `src/WorkflowTest.jsx`, `src/ResultSummary.jsx` | Submission form, trace, decision forms |
| Scoring | `src/ScoringStudio.jsx`, `src/scoringPolicy.js` | Standalone rules and saved versions |
| Documents | `src/pdfReader.js`, `src/paperFindings.js`, `scripts/copy-pdf-worker.mjs` | PDF text, candidates, browser-worker preparation |
| AI | `src/aiContext.js`, `server/ai.js`, `server/nextAiRoute.js`, `app/api/ai-*` | Bounds, provider calls, Next.js endpoints |
| Prediction readiness | `src/prediction/datasetSchema.js`, `datasetValidation.js`, `readiness.js`, `featureMatrix.js`, `server/prediction/readinessRoute.js`, `app/api/prediction/datasets/readiness/route.js` | Synthetic snapshot validation, Scenario A/B/C selection, time-based split and leakage-safe feature contract |
| Prediction screens and generation | `app/prediction/page.jsx`, `src/prediction/PredictionStudio.jsx`, `PredictionOverview.jsx`, `SyntheticDatasetWizard.jsx`, `DatasetPreview.jsx`, `DataReadinessReport.jsx`, `server/prediction/generationRoute.js`, `app/api/prediction/datasets/generate/route.js` | Screens 1–3, configurable in-memory generation, preview/download and presentation of the shared readiness result |
| Prediction training | `src/prediction/trainingConfig.js`, `ModelConfiguration.jsx`, `ModelTrainingComparison.jsx`, `server/prediction/trainingRoute.js`, `trainingClient.js`, `app/api/prediction/training/route.js`, `ml/prediction_service/` | Screens 4–5, server-side readiness recheck, checkpoint-safe matrix, isolated local scikit-learn provider and held-out comparison |
| Prediction governance and inference | `ModelApprovalPanel.jsx`, `ModelPublication.jsx`, `PredictionSandbox.jsx`, `predictionService.js`, `server/prediction/modelRegistry.js`, `modelRoutes.js`, `predictionRoute.js`, `app/api/prediction/models/`, `app/api/prediction/predict/` | Screens 6–8, in-process candidate registry, one-way approval/publication, scope-compatible model selection, fallback prediction and read-only response |

`src/WorkflowView.jsx` and `src/ExtractionPanel.jsx` are older retained implementations. The active main app imports `WorkflowStudio.jsx` under the local name `WorkflowView`; the similarly named old file is not the active entry point.

## State ownership

`useDraft` owns persisted name, fields, nodes, and standalone policy. App state separately owns submission values. `WorkflowStudio` owns runs, review history, and approved duplicate records. Refs prevent overlapping local actions and detect stale reviews after configuration/submission changes.

Canvas selection, zoom, library visibility, and undo are transient. Sidebar collapse has a separate preference key. Clear saved draft removes KPI storage and reloads, resetting session state while retaining sidebar preference.

## Graph and scoring design

Nodes and route IDs form a directed acyclic graph. The visual hierarchy can share a later node across paths. Layout derives from connections; execution follows one selected route at a time, not every visible branch.

The new Publication workflow omits simulated indexing and AI. Its Clear branch runs the generic saved-policy action; Needs review and Ineligible bypass scoring, and all three paths converge on the same specialized Appraiser review node. Older 12-step publication graphs retain their index/scoring/AI handlers for saved-draft compatibility. Generic Actions reuse tool handlers without forcing every KPI into the publication example. Product creation is ordered Inputs → Scoring policy → Workflow: organizations define reusable scoring rules/components and connect them to workflow evidence. Formula policies support arbitrary component counts and generic aggregation; they do not encode a particular document count or KPI. Legacy Read/External lookup/PDF-only/review-branch steps remain loadable for saved-draft compatibility but are hidden from the new experience.

## Reusable tool layer

`reusableTools.js` defines generic tool ports, defaults, validation and execution. `ReusableSettings.jsx` exposes creator configuration. `PluginPicker.jsx` presents the built-in Publication workflow and can add the complete 10-step verification and scoring flow at once; `publicationWorkflow(fields, policy)` wraps publication operations while preserving Submit and the generic Apply scoring policy Action. The active saved version is preselected when available. Clear routes through scoring; Needs review and Ineligible go directly to shared Appraiser review. The former simulated-index and AI steps remain readable in old graphs but are not offered by the new plugin. Replacing a populated graph requires explicit confirmation, and the canvas Undo restores the prior graph. Plugin wrappers retain operation IDs and contracts. No third-party package execution or runtime plugin installation is introduced.

Evidence sections carry PDF page, PPTX slide, or spreadsheet sheet/range locations. AI combines a primary input, named mapped contexts, creator rubric and optional output schema before the shared input-bound checks; provider calls are blocked when those checks indicate truncation. Parsed numeric schema fields can feed formula policy components. Generic Human review assembles the complete executed package and terminates automation for transfer to the separate review module; it does not create decision branches.

## Prediction Framework boundary

The implemented prediction foundation now includes the seeded generator, KCT/PADS role/KRA cap fixtures, four scenario datasets, screens 1–8, canonical validation, Scenario A/B/C selection, time-based cycle splitting, feature-leakage guards, local established-candidate training, held-out comparison, candidate governance, publication and sandbox inference. Its row contract is recorded in the [prediction data dictionary](PREDICTION-DATA-DICTIONARY.md), readiness in the [prediction readiness contract](PREDICTION-READINESS.md), training in the [prediction training contract](PREDICTION-TRAINING.md), and lifecycle/inference in [prediction governance and inference](PREDICTION-GOVERNANCE-AND-INFERENCE.md).

The browser holds generated previews, editable training choices, the latest comparison, public model metadata, and the latest sandbox result in component memory. Filters never change readiness or training input. `POST /api/prediction/training` reruns readiness, validates the fixed target/features/candidates/seed, rebuilds the completed-row matrix and invokes a local Python process through JSON stdin/stdout. Python fits preprocessing on training rows only, compares two transparent baselines with established regressors, and returns metrics plus server-owned serialized candidate artifacts. Artifacts never enter the public response.

The Node process stores candidate records and artifacts in an in-process registry. Decision and publication routes enforce one-way lifecycle transitions and exact organization/target/policy/framework compatibility. Publication makes one compatible model active and marks an earlier active record superseded without deleting it. The prediction route revalidates both history and the current checkpoint, selects the published compatible artifact only for Scenario B/C, invokes the Python provider without refitting, and returns an advisory result. Scenario A uses the transparent rule baseline; Scenario B falls back safely if no model exists; Scenario C refuses inference without one. No route mutates evidence or the official score.

The local Python provider and in-process registry are intentionally isolated prototype boundaries. They are suitable for the local review environment, not a Vercel/serverless production architecture: production requires a durable job service, signed artifact store, tenant authorization, resource isolation, audit records, controlled dependency packaging, monitoring and rollback. A page reload loses browser orchestration state; a server restart loses the registry and artifacts.

The planned [Prediction Framework](PREDICTION-FRAMEWORK-IMPLEMENTATION-PLAN.md) consumes versioned, verified progress snapshots and predicts only the final overall score in its first iteration. It remains downstream of Framework Studio and deterministic scoring and cannot mutate evidence, policy calculations, reviews, or the official score.

The implemented prototype separates model preparation from sandbox inference. Completed cycles and checkpoint snapshots feed readiness, training, time-based evaluation, approval, and the local organization-scoped registry. The current verified snapshot uses either a rule-based estimate, a safe Scenario B fallback, or the active compatible organization model. It does not retrain during inference. Employee dashboard integration, durable registry/storage, monitoring and scheduled retraining remain planned.
