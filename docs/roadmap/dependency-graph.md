# Dependency graph

Status: Draft

```mermaid
flowchart TD
  P00[00 Documentation governance] --> P01[01 Foundation]
  P01 --> P02[02 Authentication]
  P02 --> P03[03 Organizations]
  P03 --> P04[04 Authorization and audit]
  P04 --> P05[05 Provider connections]
  P05 --> P06[06 Sync engine]
  P06 --> P07[07 Resource inventory]
  P07 --> P08[08 Applications and environments]
  P08 --> P09[09 Deployments]
  P08 --> P10[10 Configuration metadata]
  P07 --> P11[11 Dashboard and search]
  P06 --> P12[12 Notifications]
  P05 --> P13[13 GitHub integration]
  P06 --> P14[14 Background operations]
  P04 --> P15[15 Public API and automation]
  P09 --> P16[16 Production hardening]
  P10 --> P16
  P11 --> P16
  P12 --> P16
  P13 --> P16
  P14 --> P16
  P15 --> P16
```

## Critical path

The critical path is governance → foundation → authentication → organizations →
authorization → provider connections → synchronization → inventory →
applications → deployments → production hardening.

Dashboard polish and provider breadth must not bypass this path.

## Dependency rules

- A feature may depend on an earlier phase or stable shared primitive.
- Circular feature dependencies require redesign or an ADR.
- Optional integrations depend inward on core contracts; core domain modules do
  not import provider implementations.
- Public APIs depend on stable application services, not UI modules.
- Notifications consume domain events and never become the source of truth.
