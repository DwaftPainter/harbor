# Phase 00 — Documentation governance

Status: Draft  
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

- [ ] Every documentation area has an index and owner model.
- [ ] Every planned feature maps to a phase.
- [ ] Templates contain security, testing, and operations requirements.
- [ ] Document lifecycle and change control are approved.
- [ ] Link and formatting checks are defined.

## Exit criteria

The documentation system is approved, navigable, internally consistent, and
sufficient to create a bounded Phase 01 work package without inventing
requirements.
