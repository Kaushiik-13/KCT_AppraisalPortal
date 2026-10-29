import { createHash } from "node:crypto";

const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const scopeKey = ({ organizationId, target, policyVersion, frameworkVersion }) => (
  [organizationId, target, policyVersion, frameworkVersion].join("|")
);

const publicRecord = (record) => {
  if (!record) return null;
  const { artifact, ...visible } = record;
  return structuredClone(visible);
};

export function createModelRegistry() {
  const records = new Map();
  const activeByScope = new Map();
  const versionsByScope = new Map();

  const replace = (record) => {
    records.set(record.id, Object.freeze(record));
    return publicRecord(record);
  };

  return {
    registerTraining({
      runId,
      organizationId,
      target,
      snapshotId,
      snapshotChecksum,
      configurationChecksum,
      policyVersion,
      frameworkVersion,
      scoreRange,
      featureSchema,
      provider,
      baselines,
      candidates,
      recommendation,
      createdAt,
    }) {
      const registered = [];
      for (const candidate of candidates) {
        if (candidate.status !== "succeeded" || !candidate.artifact) continue;
        const id = `model-${digest({ runId, candidate: candidate.id }).slice(0, 16)}`;
        const existing = records.get(id);
        if (existing) {
          registered.push(publicRecord(existing));
          continue;
        }
        registered.push(replace({
          id,
          lifecycle: "candidate",
          synthetic: true,
          organizationId,
          target,
          runId,
          dataset: { snapshotId, checksum: snapshotChecksum },
          configurationChecksum,
          featureSchema: structuredClone(featureSchema),
          compatibility: { policyVersion, frameworkVersion, scoreRange: structuredClone(scoreRange) },
          algorithm: {
            id: candidate.id,
            label: candidate.label,
            parameters: structuredClone(candidate.parameters),
            provider: structuredClone(provider),
          },
          evaluation: {
            metrics: structuredClone(candidate.metrics),
            baselines: structuredClone(baselines),
            recommendationEligible: recommendation.gatePassed && recommendation.candidateId === candidate.id,
            recommendationReason: recommendation.reason,
            warnings: structuredClone(candidate.warnings || []),
          },
          artifact: structuredClone(candidate.artifact),
          createdAt,
          approval: null,
          publication: null,
        }));
      }
      return registered;
    },

    get(id, { includeArtifact = false } = {}) {
      const record = records.get(id);
      return includeArtifact ? record || null : publicRecord(record);
    },

    decide(id, { decision, reviewer, note, decidedAt }) {
      const record = records.get(id);
      if (!record) throw Object.assign(new Error("Model candidate not found."), { code: "MODEL_NOT_FOUND" });
      if (record.lifecycle !== "candidate") throw Object.assign(new Error("This candidate already has a final decision."), { code: "MODEL_STATE_CONFLICT" });
      if (!record.evaluation.recommendationEligible && decision === "approved") {
        throw Object.assign(new Error("Only a candidate that passed the comparison gate can be approved."), { code: "MODEL_NOT_ELIGIBLE" });
      }
      if (!new Set(["approved", "rejected"]).has(decision)) throw Object.assign(new Error("Decision must be approved or rejected."), { code: "MODEL_DECISION_INVALID" });
      const trimmedReviewer = String(reviewer || "").trim();
      const trimmedNote = String(note || "").trim();
      if (trimmedReviewer.length < 2 || trimmedReviewer.length > 80 || trimmedNote.length < 3 || trimmedNote.length > 500) {
        throw Object.assign(new Error("Reviewer and a 3–500 character decision note are required."), { code: "MODEL_DECISION_INVALID" });
      }
      return replace({
        ...record,
        lifecycle: decision,
        approval: { decision, reviewer: trimmedReviewer, note: trimmedNote, decidedAt },
      });
    },

    publish(id, compatibility, publishedAt) {
      const record = records.get(id);
      if (!record) throw Object.assign(new Error("Model candidate not found."), { code: "MODEL_NOT_FOUND" });
      if (record.lifecycle !== "approved") throw Object.assign(new Error("Only an approved candidate can be published."), { code: "MODEL_STATE_CONFLICT" });
      const expected = {
        organizationId: record.organizationId,
        target: record.target,
        policyVersion: record.compatibility.policyVersion,
        frameworkVersion: record.compatibility.frameworkVersion,
      };
      if (Object.entries(expected).some(([key, value]) => compatibility?.[key] !== value)) {
        throw Object.assign(new Error("The publication scope is incompatible with this candidate."), { code: "MODEL_INCOMPATIBLE" });
      }
      const key = scopeKey(expected);
      const priorId = activeByScope.get(key);
      if (priorId && priorId !== id) {
        const prior = records.get(priorId);
        replace({
          ...prior,
          lifecycle: "superseded",
          publication: { ...prior.publication, supersededAt: publishedAt, supersededByModelId: id },
        });
      }
      const versionNumber = (versionsByScope.get(key) || 0) + 1;
      versionsByScope.set(key, versionNumber);
      const version = `${record.organizationId}-${record.target}-v${versionNumber}`;
      const published = replace({
        ...record,
        lifecycle: "published",
        publication: { version, publishedAt, supersedesModelId: priorId || null },
      });
      activeByScope.set(key, id);
      return { model: published, supersededModel: priorId ? publicRecord(records.get(priorId)) : null };
    },

    findPublished(compatibility, { includeArtifact = false } = {}) {
      const id = activeByScope.get(scopeKey(compatibility));
      if (!id) return null;
      const record = records.get(id);
      if (!record || record.lifecycle !== "published") return null;
      return includeArtifact ? record : publicRecord(record);
    },

    clear() {
      records.clear();
      activeByScope.clear();
      versionsByScope.clear();
    },
  };
}

const registryKey = Symbol.for("afpi.prediction.modelRegistry.v1");
if (!globalThis[registryKey]) globalThis[registryKey] = createModelRegistry();
export const modelRegistry = globalThis[registryKey];
