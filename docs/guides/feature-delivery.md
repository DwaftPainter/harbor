# Feature delivery workflow

Status: Draft

1. Select the next dependency-safe phase outcome.
2. Copy the feature template and define behavior, entities, permissions, API/UI,
   validation, edge cases, dependencies, and exclusions.
3. Update architecture/database/API documents and create ADRs for material
   choices.
4. Write acceptance criteria and a risk-based test matrix.
5. Obtain `Approved` status and confirm phase entry criteria.
6. Break work into vertical increments that remain releasable or safely hidden.
7. Create an AI implementation prompt citing exact approved documents and files.
8. Implement within scope; pause for any missing or contradictory requirement.
9. Run review, security, data, accessibility, and operations checklists.
10. Verify phase exit evidence, update documents to `Implemented`, and record
    deferred work.

Each increment should include its data, authorization, server boundary, UI,
tests, telemetry, and rollback impact rather than leaving quality concerns for a
later horizontal pass.
