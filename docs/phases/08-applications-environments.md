# Phase 08 — Applications and environments

Status: Draft  
Estimated complexity: High

## Objective

Organize provider resources into Harbor applications and environments without
losing provider provenance.

## Scope

Application lifecycle, environment classification, resource bindings, automatic
suggestions, manual correction, naming, archive behavior, and overview UI.

## Prerequisites

- Phase 07 complete.
- Applications and environments specifications approved.

## Entry criteria

- Ownership, binding cardinality, environment vocabulary, and conflict behavior
  are decided.

## Deliverables

- Organization-owned applications and environments.
- Explicit resource bindings with source and confidence.
- Application list/detail and environment navigation.
- Safe archive and binding correction workflows.

## Implementation order

1. Define application, environment, and binding invariants.
2. Add lifecycle and permission enforcement.
3. Add deterministic suggestion rules without silent auto-mutation.
4. Build overview and correction UI.
5. Test conflicts, archive, and provider disconnection.

## Documents required

- Applications and environments features
- Relevant entities and relationships
- Authorization matrix and API contracts

## Completion checklist

- [ ] Resource binding ownership cannot cross organizations.
- [ ] User-confirmed bindings override suggestions predictably.
- [ ] Environment labels do not imply provider mutation.
- [ ] Archive preserves audit and historical deployment context.
- [ ] Empty and partially synced applications remain understandable.

## Exit criteria

Users can construct a stable Harbor application model from synchronized
resources and navigate it by environment.
