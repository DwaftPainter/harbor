# Incident and recovery documentation

Status: Draft

## During an incident

Maintain a timestamped record of impact, detection, severity, commander,
responders, hypotheses, evidence, containment, decisions, user communication,
and next update. Never paste credentials, personal data, or unsafe raw provider
payloads.

## Recovery decision

Document affected organizations/features, consistency risk, credential risk,
job/sync state, data restore implications, provider limits, rollback/forward-fix
choice, verification query or test, and owner approval.

## After stabilization

Create:

- factual timeline and impact;
- root and contributing causes;
- detection/response gaps;
- data and tenant-isolation assessment;
- corrective actions with owner and deadline;
- required ADR, architecture, feature, standard, runbook, test, or alert updates;
- evidence that temporary access and mitigations were removed.

Urgent code-first mitigation is allowed only for active incident containment.
Documentation and review are completed immediately afterward and cannot be
waived permanently.
