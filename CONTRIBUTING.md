# Contributing to AFPI

AFPI uses module ownership, reviewable Issues and pull requests, and protected shared documentation.

For prerequisites and current web/API start commands, begin with the [repository README](README.md).

1. Choose a GitHub Issue and identify the responsible module and owner.
2. For an independent feature, branch from the latest `main`; for a stack, branch from the explicitly identified parent branch. Follow `feat/<module>/<issue>-<topic>`, `fix/<module>/<issue>-<topic>` or `docs/<area>/<issue>-<topic>`.
3. Develop only within approved Issue scope. Keep module Markdown under `docs/modules/<module>/`. Do not edit project/development documentation on a feature branch.
4. Coordinate API/data contracts before cross-module changes; use separate module PRs.
5. Run relevant tests and build, inspect your diff, and open a PR using the mandatory template.
6. Obtain approval from at least one other human and passing required checks. An authorized maintainer controls merging and stacked-branch history changes.
7. Link a separate authorized docs PR for changes to project architecture, shared schema, or integration contracts. Keep the overall Issue open until both parts merge.
8. Clean up merged branches only after verification, with stacked dependencies resolved.

**Documentation:** [Project](docs/project/OVERVIEW.md) · [Modules](docs/modules/) · [Development rules](docs/development/BRANCHING-AND-PRS.md) · [Historical reference](docs/reference/legacy/README.md).

Review [AGENTS.md](AGENTS.md) for mandatory agent restrictions and [documentation rules](docs/development/DOCUMENTATION-RULES.md) for protected files.
