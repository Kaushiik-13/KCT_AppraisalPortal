# Working on Framework Studio

## Before changing code

Read [architecture](docs/ARCHITECTURE.md), [data model](docs/DATA-MODEL.md), and the relevant feature guide. The active workflow component is `WorkflowStudio.jsx`, not the older `WorkflowView.jsx` file.

Keep changes incremental and reviewable. Desktop workflow clarity, creator control, and preservation of existing drafts are current priorities. Do not replace a user's only browser draft to demonstrate a feature; use an isolated test session.

## Development workflow

1. Install with `npm.cmd ci` and start `npm.cmd run dev`.
2. Change the appropriate model, UI, execution, and persistence layers together when adding a capability.
3. For behavior changes, add meaningful cases to the nearest existing test suite.
4. Run `npm.cmd test` and `npm.cmd run build` as appropriate. Check UI changes in a browser, including restore behavior when state changes.
5. Update the affected documentation in the same session, including changed usage, contracts, decisions, roadmap status, and verified limitations as applicable.
6. Check changed documentation links/examples and include the documentation updates in the completion report. A change is not complete while its relevant documentation is stale.

For a tool, follow [Tools and extensions](docs/TOOLS-AND-EXTENSIONS.md). For persisted changes, preserve incomplete drafts and older configurations; add explicit migrations before changing schema versions. Do not equate editable schema validation with execution readiness.

## Implementation conventions

- Keep stable IDs independent of display labels.
- Treat missing evidence as unknown; do not turn provider failure into a negative finding or zero score.
- Keep provider keys server-side and use injected adapters in tests.
- Preserve policy/run snapshots and original scores in review flows.
- Keep AI instructions separate from evidence; label simulations and truncation.
- Reuse runtime preflight for UI readiness instead of maintaining contradictory validation rules.
- Avoid silently changing institutional scoring rules.

## Documentation maintenance

Documentation is a required part of the development loop: **read → implement → verify → update docs → report**. This project-owner requirement is also recorded in [AGENTS.md](AGENTS.md) for future development sessions. Update only affected documents; explicitly assess documentation impact even when no update is needed.

User behavior belongs in user guides, contracts in technical references, and unimplemented work in the roadmap. Update [the index](docs/README.md) for new documents. Use relative links, parseable JSON examples, and labelled illustrative data. Never include real keys, personal submissions, or invented release dates. Historical verification reports should remain dated checkpoints; add new evidence instead of rewriting their original results.
