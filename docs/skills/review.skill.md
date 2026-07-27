# Skill — Harbor review

## Purpose

Review documentation, plans, diffs, and implementations against approved Harbor
contracts with precise, risk-ranked, actionable findings.

## Principles

Evidence before preference; correctness/security/data loss first; distinguish
requirements from suggestions; review only changed or affected scope; no
implementation during a review-only task.

## Required context

Task intent, diff or documents, approved phase/feature/architecture/API/database/
ADR/standards, current tests/checks, operational context, and known constraints.

## Workflow

1. Establish expected behavior and affected contracts.
2. Trace data, authorization, state, errors, transactions, jobs, providers, UI,
   and operations through the change.
3. Verify tests against risks and acceptance criteria.
4. Rank findings by impact and confidence.
5. Identify contradictions, missing evidence, and positive conformance.
6. Give a clear ship/no-ship recommendation.

## Output format

Findings first, ordered Critical/High/Medium/Low, each with location/evidence,
impact, violated contract, and minimal remediation. Then open questions,
verification gaps, conformance highlights, and recommendation.

## Things to avoid

Style-only noise, hypothetical scale without evidence, rewriting the solution,
unranked lists, praise before blockers, claims without file/document evidence,
scope expansion, and silently fixing during diagnosis/review.

## Quality checklist

- [ ] Findings map to approved requirements or concrete risk.
- [ ] Security, tenant isolation, data/migrations, concurrency, failures, and
      recovery are considered.
- [ ] Severity and remediation are proportionate.
- [ ] Test/verification gaps are explicit.
- [ ] Recommendation is clear and implementation was not mutated.
