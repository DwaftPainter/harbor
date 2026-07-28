# Phase 00 — Documentation governance

Status: Implemented
Estimated complexity: Medium

## Objective

Establish one authoritative documentation system that gates implementation and
can be safely consumed by people and AI agents.

## Scope

Taxonomy, templates, lifecycle states, ownership, review workflow, traceability,
link validation, ADR process, standards, prompts, and project skills.

## Prerequisites

- Product vision and initial technology choices are known.
- Repository ownership is assigned.

## Entry criteria

- Stakeholders agree that approved documentation is required before code.

## Deliverables

- Complete `docs/` navigation and templates.
- Roadmap, phases, feature specifications, architecture, API, database, ADRs,
  standards, guides, prompts, and AI skills.
- CI requirements for formatting, links, and required document sections.

## Implementation order

1. Define taxonomy and metadata.
2. Define roadmap and phase gates.
3. Define architecture and feature contracts.
4. Define standards, ADRs, prompts, and skills.
5. Validate coverage and links.

## Documents required

- `docs/README.md`
- All phase-zero-linked indexes and templates
- ADR 0006, Documentation First
- Documentation and Definition of Done standards

## Completion checklist

- [x] Every documentation area has an index and owner model.
- [x] Every planned feature maps to a phase.
- [x] Templates contain security, testing, and operations requirements.
- [x] Document lifecycle and change control are implemented.
- [x] Link and formatting checks are defined.

## Evidence

- `docs/README.md` defines lifecycle, navigation, change control, and role-based
  ownership.
- `docs/features/README.md` maps every planned feature to a phase.
- Phase and feature templates require security, testing, and operations.
- `pnpm docs:check` validates metadata, required sections, and local links;
  Prettier enforces Markdown formatting in `pnpm check`.
- `.github/workflows/quality.yml` enforces the documentation gates for changes.

## Exit criteria

The documentation system is approved, navigable, internally consistent, and
sufficient to create a bounded Phase 01 work package without inventing
requirements.
