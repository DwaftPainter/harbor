# AI-assisted development

Status: Draft

## Before work

An AI agent must load:

1. `AGENTS.md` and repository instructions;
2. the relevant document from `docs/skills/`;
3. the active phase and feature specifications;
4. affected architecture, database, API, ADR, and standards documents;
5. current repository state and library documentation required by project rules.

## Task contract

The prompt states objective, allowed scope, explicit non-goals, documents,
acceptance criteria, verification, mutation permissions, and expected handoff.

## Agent rules

- Do not invent unresolved behavior or mark Draft requirements as approved.
- Do not broaden scope to “complete” adjacent features.
- Preserve user work and call out documentation/code disagreement.
- Prefer a small vertical increment and explicit domain language.
- Stop when a missing decision changes security, data meaning, public contracts,
  or product behavior.
- Report files changed, verification evidence, deviations, and open risks.

## Review

AI output receives the same human review, security gates, tests, and Definition
of Done as human-authored output. Generated code or prose has no special
authority.
