# Prediction — Architecture

## Status

**Proposed logical responsibility.** This document does not select infrastructure or claim an implemented production model service.

## Current implementation

No production-oriented Prediction module has been verified. The existing prediction prototype and its fixtures remain historical reference.

## Proposed responsibility

Prediction provides organization administrators with a controlled place to build, train, and evaluate prediction models in a sandbox, then make approved outputs available to authorized application capabilities. It should expose readiness, evaluation, provenance, version, and limitation information needed for responsible use.

## Proposed integration points

- Receives institution-scoped data/configuration through a future approved contract.
- May run training/evaluation as asynchronous jobs because model work can be long-running; queue technology and service boundary are undecided.
- Returns versioned evaluation and prediction outputs for authorized analytics or other approved workflows.
- Must not expose faculty-level predictions until institutional visibility and access rules are agreed.

## Known limitations

Prediction goals, permitted features/data, evaluation criteria, fairness requirements, approval and publication lifecycle, storage, runtime, monitoring, and deployment are unresolved. Existing PoC APIs do not define the new production contract.
