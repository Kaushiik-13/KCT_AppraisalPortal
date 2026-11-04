# AFPI development governance

These rules apply to all contributors and coding agents.

## Scope and ownership
- Start every task by identifying its assigned GitHub Issue, module, owner, branch and PR base.
- Work only on the assigned Issue. Report unrelated findings separately; request authorization for blockers or expanded scope.
- Agents may commit and push **only** to their explicitly assigned branches.
- Before making changes, inspect working-tree state, current branch, uncommitted changes and active dependent PRs.
- Never change another contributor's branch or PR without explicit authorization.
- Never merge, restack, change PR bases, force-push, delete branches or change repository settings without explicit authorization.

## Documentation ownership
- Module feature branches may edit Markdown only under `docs/modules/<assigned-module>/`, and only as required by their Issue.
- `docs/project/`, `docs/development/`, root Markdown governance documents and `.github/` governance files are protected. Edit them only in explicitly authorized, dedicated documentation/governance branches and PRs.
- Cross-module implementation work uses separate module-owned PRs with an agreed API/data contract and integration tests.
- Architecture-changing work requires an authorized, linked project-documentation PR; the overall Issue stays open until implementation and documentation are merged.
- State clearly what is **Current implementation**, **Proposed design** and **Known limitations**. Never label unverified functionality as implemented.

## Pull requests and checks
- No direct pushes to `main`. Every PR links an Issue and completes `.github/PULL_REQUEST_TEMPLATE.md`.
- One approving human reviewer other than the author and passing required CI are mandatory.
- Run change-aware tests and a production build for affected code; perform full integration verification before merge.
- Default to squash-and-merge. For stacked PRs, declare parent PR, merge bottom-up, and obtain explicit authorization before restacking. Merely retargeting a child after a squash merge is insufficient; validate the resulting diff.
- Branch owners resolve ordinary conflicts, cross-module conflicts need agreement among owners, and stack history changes require authorization.
- Never blindly accept one side of a merge conflict. Re-test after resolution.
- Delete merged branches only after verification and confirming no stacked dependents still require them; agents never delete branches automatically.

See [branch and PR policy](docs/development/BRANCHING-AND-PRS.md), [testing standards](docs/development/TESTING-STANDARDS.md), and [documentation policy](docs/development/DOCUMENTATION-RULES.md).
