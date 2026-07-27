# Phase 12 — Notifications

Status: Draft  
Estimated complexity: High

## Objective

Notify users of actionable Harbor events through reliable, preference-aware
delivery.

## Scope

In-app notifications, preferences, event taxonomy, deduplication, delivery
attempts, read state, email only if approved, and failure telemetry.

## Prerequisites

- Phase 06 event and job infrastructure is stable.
- Phase 04 permissions are enforced.

## Entry criteria

- Initial event catalog, recipients, channels, and retention are approved.

## Deliverables

- Domain-event-to-notification policy.
- In-app inbox, unread state, and preferences.
- Idempotent fan-out and delivery tracking.
- Rate, noise, and failure controls.

## Implementation order

1. Define event and recipient rules.
2. Define preference and deduplication semantics.
3. Implement durable fan-out and in-app delivery.
4. Build inbox and preference UI.
5. Test duplicates, removed members, floods, and retries.

## Documents required

- Notifications feature
- Background-jobs architecture
- Notification entities, API contract, and retention policy

## Completion checklist

- [ ] Duplicate domain events do not duplicate notifications.
- [ ] Removed users stop receiving organization events.
- [ ] Permission-sensitive details are rendered at read time or safely snapshotted.
- [ ] Preferences cannot suppress mandatory security events without policy.
- [ ] Delivery failures are observable and bounded.

## Exit criteria

Users receive timely, non-duplicative, authorized notifications and can control
non-mandatory delivery.
