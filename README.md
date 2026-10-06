# AFPI Framework Studio

A desktop proof of concept for creating configurable KPI forms, verification workflows, and scoring policies. The aim is to let different institutions compose their own KPIs from shared tools. Publication verification is the first worked example, not the only supported workflow.

Documentation baseline: **4 October 2026**. This is a local PoC, not a production appraisal platform.

## Run locally

```powershell
npm.cmd ci
npm.cmd run dev
```

Open `http://127.0.0.1:5173/`. On other shells, `npm` can replace `npm.cmd`.

```powershell
npm.cmd test
npm.cmd run build
```

See [setup](docs/SETUP.md) for environment configuration, preview mode, and the optional OpenRouter key.

## Start here

| Need | Document |
|---|---|
| All documentation | [Documentation index](docs/README.md) |
| Project purpose and scope | [Project brief](docs/PROJECT-BRIEF.md) |
| Use the application | [User guide](docs/USER-GUIDE.md) |
| Test publication verification | [Publication walkthrough](docs/PUBLICATION-KPI.md) |
| Build a second KPI | [Training walkthrough](docs/TRAINING-KPI.md) |
| Understand the implementation | [Architecture](docs/ARCHITECTURE.md) |
| Work on the code | [Contributing](CONTRIBUTING.md) |
| See remaining work | [Roadmap](docs/ROADMAP.md) |

## What works

- Dynamic input fields, typed mappings, and a tree workflow canvas.
- Reusable Action, Condition, Human review, and Result blocks.
- Browser PDF extraction and live Crossref metadata lookup.
- Configurable AI inputs and system instructions, using OpenRouter or explicit simulation.
- Publication scoring and a separate, versioned general scoring builder.
- Execution traces, session review decisions, and browser-local draft autosave.
- A collapsible sidebar and confirmed Clear saved draft action.

## Boundaries

Indexing is mocked, not verified against Scopus/WOS. Only first-listed authors are automatically scored by the publication policy. SAE and later-author rules remain unresolved. There is no database, authentication, genuine reviewer assignment, durable execution, or production deployment. The two scoring paths have different approval timing; see [scoring](docs/SCORING.md).

AI can summarize findings but does not itself mutate recorded evidence or scores. Creator-authored policies can consume exposed text values; the PoC does not enforce a production evidence-trust model.

The most recent automated baseline was **87 passing tests** and a passing production build. Browser checks covered publication lookup/review, training branches/scoring, live custom AI output, sidebar recovery, and draft clearing. See [testing](docs/TESTING.md). Historical results are retained in [Phase 6 verification](PHASE-6-VERIFICATION.md).

The included PRISMA PDF is an attributed, unmodified fixture. See [sample attribution](public/samples/README.txt) and [security and data](docs/SECURITY-AND-DATA.md).

Publication is available through the built-in Plugin picker. General Actions include configurable document extraction, comparisons, date range, duplicate checks, public JSON lookup, AI and saved-policy scoring. See [tool capabilities and limitations](docs/TOOLS-AND-EXTENSIONS.md).

[Content relevance KPI guide](docs/CONTENT-RELEVANCE-KPI.md): evaluate full PDF text against your reference rubric with named AI context inputs.
