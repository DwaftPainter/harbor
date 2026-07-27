# Notifications

Status: Draft  
Owner: Engagement platform team  
Phase: 12

## Purpose

Deliver timely, authorized, non-duplicative information about actionable Harbor
events.

## Responsibilities

Event-to-recipient rules, preference evaluation, in-app delivery, read state,
deduplication, retention, mandatory security events, and delivery observability.

## User stories

- As a user, I can see unread operational notifications.
- As a user, I can control non-mandatory event categories and channels.
- As an owner, I receive required security notices according to policy.

## Domain concepts

Notification event, recipient, channel, preference, mandatory category,
deduplication key, delivery attempt, read state, and expiry.

## Entities

Notification, notification preference, and optional channel delivery attempt.
Content is safe, bounded, and either permission-safe snapshot or rendered from
current authorized state.

## Relationships

Notifications belong to recipient and organization context and may reference a
domain event and target. Preferences belong to a user and applicable scope.

## Permissions

Users read/update their notifications/preferences. Organization policy controls
mandatory events. Administrators cannot read another user's private delivery
content by default.

## API overview

Paginated inbox, unread count, mark-read operations, and preference resources.
Fan-out is asynchronous and idempotent.

## UI overview

Notification indicator, inbox, event grouping, read/unread state, safe target
links, expired-target behavior, and preference settings.

## Validation

Allowed event/channel, current recipient eligibility, mandatory preference
rules, deduplication key, content redaction, target URL safety, and delivery
rate/noise limits.

## Edge cases

Duplicate event, member removal, permission loss, deleted target, high-volume
storm, failed channel, stale unread count, preference race, and security event
requiring delivery.

## Future improvements

Email, Slack, webhooks, digests, quiet hours, escalation, and team routing.

## Dependencies

Domain events, background jobs, organizations, authorization, audit, delivery
provider decision, and data lifecycle.

## Out of scope

Chat, arbitrary user messages, guaranteed external delivery, marketing
campaigns, and notification as source of truth.
