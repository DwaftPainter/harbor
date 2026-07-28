# Documentation standards

Status: Implemented

## Metadata

Every authoritative document states title and status. Feature/phase documents
also state owner and phase or complexity where applicable. Review/approval
evidence lives in version control and pull-request history.

## Writing

- Use Harbor domain terms consistently and define new terms.
- State behavior and invariants, not only aspirations.
- Use active voice, concrete actors, and testable outcomes.
- Separate current requirements, future improvements, open questions, and out of
  scope.
- Explain failure, permission, privacy, migration, observability, and recovery.
- Prefer small diagrams or tables when relationships are otherwise ambiguous.
- Use relative links and lowercase kebab-case filenames.

## Lifecycle

Draft → Review → Approved → Implemented → Superseded.

Implementation is blocked before Approved. Implemented means verified
conformance, not merely merged code.

## Required updates

Update documents before changing external/API behavior, persistent meaning,
authorization, provider contracts, security controls, architecture boundaries,
phase scope, or operational responsibility.

## Validation

CI checks Markdown formatting, document metadata, internal links, and required
phase/feature-template sections. Mermaid semantics, prohibited secrets,
correctness, and sufficiency remain human review responsibilities.
