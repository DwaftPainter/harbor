# Harbor AI skills

Harbor's project-specific AI skills are documentation assets, not executable
application code. The canonical catalog is maintained in
[`docs/skills/`](../docs/skills/README.md).

Agents must load the relevant skill documents before planning or implementing
work. Runtime-specific adapters may reference that catalog, but must not fork
or duplicate its instructions.
