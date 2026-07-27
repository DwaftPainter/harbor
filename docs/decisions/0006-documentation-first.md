# ADR 0006 — Adopt Documentation First

Status: Accepted  
Date: 2026-07-27  
Deciders: Project leadership

## Context

Harbor has security-sensitive multi-tenant behavior, many providers, long-lived
data contracts, and significant AI-assisted implementation. Unwritten
assumptions would multiply inconsistency, unsafe scope expansion, and rework.

## Decision

No implementation starts without approved feature and phase documentation.
Material architecture, persistence, API, security, and operations changes update
their documents first. AI prompts cite exact approved sources and cannot invent
missing requirements.

## Consequences

### Positive

- Requirements, boundaries, permissions, failure behavior, and acceptance remain
  reviewable and traceable.
- Work can be delivered in bounded phases by humans or AI agents.
- Decisions and deferred scope survive contributor turnover.

### Negative

- Up-front writing and review add lead time.
- Stale or low-quality documents can create false confidence.
- Urgent incidents need a controlled retrospective documentation path.

### Risks and mitigations

- Documentation theater — require testable criteria and post-implementation
  conformance.
- Excessive ceremony — scale review to risk and keep templates concise.
- Drift — Definition of Done includes documentation status and contract updates.

## Alternatives considered

- Code-first with later docs — unacceptable drift and AI ambiguity.
- README-only planning — insufficient for permissions, data, failures, and phases.
- Comprehensive design freeze — conflicts with incremental learning.

## Validation

Traceability audits, reduced undocumented deviations, phase-entry review quality,
and implementation plans that do not invent unresolved behavior.

## References

- [Documentation workflow](../guides/documentation-workflow.md)
- [Documentation standard](../standards/documentation.md)
