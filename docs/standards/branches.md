# Branch strategy

Status: Draft

Harbor uses short-lived branches from a protected main branch.

## Rules

- `main` is releasable and protected by required review/checks.
- Branch names use `<type>/<issue-or-scope>-<short-description>`.
- Rebase or update before merge according to repository policy; do not rewrite
  another contributor's branch without consent.
- Prefer small pull requests delivering one documented vertical increment.
- Merge by squash unless preserving multiple reviewed commits has clear value.
- Delete merged branches.
- Release tags identify deployable versions; environment branches are not used.
- Hotfixes branch from the current production commit, receive security/owner
  review, then merge back to main with retrospective docs if incident urgency
  required implementation first.

Long-lived feature branches, direct pushes to main, and separate branches per
environment are prohibited.
