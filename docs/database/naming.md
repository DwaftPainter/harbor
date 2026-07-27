# Database naming conventions

Status: Draft

## Rules

- Use lowercase snake_case for database objects and columns.
- Use plural table names for Harbor-owned product entities. Better Auth-managed
  table names follow its configured schema and are not renamed casually.
- Use singular domain names in TypeScript when representing one entity.
- Primary identifiers are `id`; foreign identifiers are `<entity>_id`.
- Provider identifiers use `external_id`, never an ambiguous `provider_id` when
  that could mean provider type.
- Time fields end in `_at`: `created_at`, `updated_at`, `occurred_at`,
  `observed_at`, `expires_at`, `deleted_at`.
- Boolean names describe truth: `is_active`, `email_verified`; avoid negation.
- Encrypted values use `_ciphertext`; fingerprints use `_fingerprint`; key
  versions use `_key_version`.
- Enum values are stable lowercase snake_case strings.

## Constraints and indexes

Names identify table, relevant columns or purpose, and kind:

- uniqueness: `<table>_<columns>_unique`
- foreign key: `<table>_<column>_<target>_fk`
- check: `<table>_<rule>_check`
- index: `<table>_<columns>_idx`

Generated names may be retained when deterministic and understandable.

## Reserved meanings

- `status` requires a documented state machine or taxonomy.
- `type` requires a bounded discriminator.
- `metadata` is provider-native or extension data, not a substitute for modeled
  domain fields.
- `data` and `value` are prohibited unless the feature defines their exact
  content and security classification.
