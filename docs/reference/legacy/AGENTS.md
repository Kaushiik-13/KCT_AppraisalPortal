# Project development instructions

## Keep documentation in the development loop

The project owner explicitly requires documentation to progress with development. Treat documentation maintenance as part of completing each change, not a separate task to postpone.

1. Before implementation, read the relevant guides in `docs/` and identify which documented behavior or contracts will change.
2. Implement and verify the change, then update the affected documentation in the same work session before reporting completion.
3. Update user guides for changed controls and flows; technical references for architecture, schemas, tools, API, scoring, AI, persistence, and security behavior.
4. Record material design choices in `docs/DECISIONS.md`, update implemented versus planned status in `docs/ROADMAP.md`, and add substantive feature changes to `docs/CHANGE-HISTORY.md`.
5. Update `docs/TESTING.md` when test coverage, verification results, or limitations change. Report only checks actually performed. Keep historical verification reports intact.
6. Update `README.md` and `docs/README.md` when entry points, scope, or documentation navigation changes. Check changed local links and JSON examples.
7. Briefly mention relevant documentation updates in the completion report. If a change has no documentation impact, make that determination explicitly rather than rewriting unrelated documents.

Keep documentation accurate and proportional to the change. Do not present planned features as implemented, include secrets or personal submissions, or copy stale examples forward without checking them against the code.

See `CONTRIBUTING.md` for the development workflow and `docs/README.md` for the documentation index.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
