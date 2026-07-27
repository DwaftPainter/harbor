# Skill — Harbor documentation

## Purpose

Create authoritative, consistent, testable Harbor documentation before
implementation.

## Principles

Documentation First; distinguish current/future/out-of-scope; use one domain
vocabulary; explicit security, ownership, failures, and acceptance; never infer
approval.

## Required context

`docs/README.md`, documentation workflow/standard, active roadmap phase,
adjacent feature/architecture/API/database documents, existing ADRs, and current
behavior when documenting an implementation.

## Workflow

1. Identify document type, owner, status, audience, and decision authority.
2. Inventory affected contracts and contradictions.
3. Use the canonical template/required sections.
4. Define measurable behavior, boundaries, dependencies, and open questions.
5. Link related sources and update indexes.
6. Validate format, links, terminology, and lifecycle state.

## Output format

Markdown with title/status metadata, short sections, relative links, diagrams
only when useful, checklists for gates, and open questions with owner/deadline.
Handoff lists files, unresolved decisions, reviewers, and validation.

## Things to avoid

Invented requirements, vague aspirations, copied vendor text, implementation
code, stale duplicates, hidden scope, premature `Approved`/`Implemented`, and
security or failure omissions.

## Quality checklist

- [ ] Correct template, owner, status, and index links.
- [ ] Terms, permissions, data, API/UI, validation, edge cases, and scope align.
- [ ] Requirements are testable and implementation-ready.
- [ ] Contradictions/open decisions are visible.
- [ ] Formatting and links pass.
