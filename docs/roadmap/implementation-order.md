# Recommended implementation order

Status: Draft

1. Approve documentation governance, standards, architecture boundaries, and
   ADRs.
2. Verify the foundation: environments, CI, quality gates, security headers,
   observability baseline, and deployment topology.
3. Implement Better Auth identity and session lifecycle without organizations.
4. Add organizations, membership lifecycle, and active-organization context.
5. Add permission evaluation and immutable audit-event creation.
6. Build encrypted provider connections with validation and revocation.
7. Implement the durable sync-run model, job execution, leases, retries, and
   provider adapter certification.
8. Sync one narrow provider resource type end to end before adding breadth.
9. Build resource inventory, then application/environment grouping.
10. Add deployment history and detail as read-only experiences.
11. Add configuration metadata with strict secret redaction.
12. Add dashboards and search over stable read models.
13. Add event-driven notifications and GitHub source context.
14. Expose controlled asynchronous operations, then public API automation.
15. Repeat provider certification incrementally.
16. Complete production hardening and launch review.

## Work-package rule

For each numbered item, create or approve:

- a feature specification;
- affected architecture and database documents;
- an ADR for material tradeoffs;
- API and UI contracts;
- a test plan and security review;
- an implementation prompt referencing exact documents;
- operational and rollback guidance.

Implementation prompts must never substitute for approved requirements.
