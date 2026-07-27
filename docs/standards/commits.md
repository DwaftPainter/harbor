# Commit conventions

Status: Draft

Use Conventional Commit form:

`<type>(optional-scope): <imperative summary>`

Allowed types: `docs`, `feat`, `fix`, `refactor`, `test`, `perf`, `build`, `ci`,
`chore`, `revert`, and `security`.

## Rules

- One coherent change per commit.
- Summary is lowercase, imperative, specific, and does not end with punctuation.
- Body explains why, non-obvious tradeoffs, migrations, risk, and rollback.
- Reference feature/phase documents and ADRs.
- Mark breaking changes explicitly.
- Never include credentials, generated local artifacts, unrelated formatting, or
  hidden implementation scope.
- Generated migrations accompany the schema change that generated them.
- Documentation-first work may be committed separately before implementation.

Examples:

- `docs(sync): approve retry and reconciliation contract`
- `feat(connections): add credential revocation lifecycle`
- `fix(auth): reject expired verification replay`

Commit history is an operational artifact; squashing follows the merge policy
but must preserve an accurate final message and decision references.
