# Branching, pull requests and stacks

## Branch naming
- Feature: `feat/<module>/<issue>-<topic>`
- Fix: `fix/<module>/<issue>-<topic>`
- Refactor: `refactor/<module>/<issue>-<topic>`
- Module docs: `docs/<module>/<issue>-<topic>`
- Protected docs: `docs/project/<issue>-<topic>`, `docs/development/<issue>-<topic>`

## Independent PRs
1. Start from the latest `main`, with a linked Issue and assigned branch owner.
2. Do not modify others' branches or expand Issue scope.
3. Push only to the assigned branch; open a PR with the mandatory template.
4. Obtain at least one **human** approval from someone other than the author, passing CI and full integration verification as applicable.
5. An authorized person squash-merges; verify the result before controlled branch cleanup. Never push directly to `main`.

## Stacked PRs
1. Declare each PR's parent branch, parent PR, stack order and designated stack maintainer.
2. Open each child PR against its immediate parent. Review/tests run against the correct PR base.
3. Merge bottom-up. After squash-merging a parent, the stack maintainer **must obtain explicit authorization** to rebase/restack child branches and change PR bases.
4. Retargeting alone may replay parent changes; inspect each child diff, avoid duplicate changes, rerun CI, and obtain fresh review where changes warrant it.
5. Do not force-push a shared branch without explicit authorization. Do not delete a branch while dependents still rely on it.

## Conflicts and cross-module work
- Branch owner resolves ordinary conflicts only within their authorized scope.
- Both affected owners agree before resolving cross-module contract conflicts.
- Multi-module changes use separate module PRs following an agreed API/data contract; integration tests must validate the combined behavior.
- Shared project and development documentation is updated only via separately authorized documentation PRs. Link architecture-changing docs PRs; the overall Issue cannot close until all required PRs merge.

## Agent permissions
Agents may commit/push only to explicitly assigned branches. Merges, PR-base changes, restacking, force pushes, branch deletion, repository settings changes and other-owner changes require explicit approval.

## Review and completion
Use the mandatory [PR template](../../.github/PULL_REQUEST_TEMPLATE.md). Document tests performed, results, limits and integration impacts. Do not mark requirements verified without evidence.
