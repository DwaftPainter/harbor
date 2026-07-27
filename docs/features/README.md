# Feature specifications

Status: Draft

| Feature                                                       | Primary phase |
| ------------------------------------------------------------- | ------------- |
| [Authentication](authentication.md)                           | 02            |
| [Organizations](organizations.md)                             | 03            |
| [Memberships and authorization](memberships-authorization.md) | 03–04         |
| [Provider connections](provider-connections.md)               | 05            |
| [Provider synchronization](provider-sync.md)                  | 06            |
| [Resource inventory](resource-inventory.md)                   | 07            |
| [Applications](applications.md)                               | 08            |
| [Environments](environments.md)                               | 08            |
| [Deployments](deployments.md)                                 | 09            |
| [Environment variables](environment-variables.md)             | 10            |
| [Audit log](audit-log.md)                                     | 04 onward     |
| [Dashboard](dashboard.md)                                     | 11            |
| [Search and filtering](search-filtering.md)                   | 11            |
| [Notifications](notifications.md)                             | 12            |
| [Background jobs](background-jobs.md)                         | 06 and 14     |
| [GitHub source control](github-source-control.md)             | 13            |
| [API access](api-access.md)                                   | 15            |

Provider-specific feature specifications:

- [Vercel](providers/vercel.md)
- [Render](providers/render.md)
- [Neon](providers/neon.md)
- [Railway](providers/railway.md)
- [Supabase](providers/supabase.md)
- [Cloudflare](providers/cloudflare.md)
- [GitHub](github-source-control.md)

Feature specifications describe product and domain behavior. They do not choose
implementation details unless those details are part of an approved contract.
Use [the template](TEMPLATE.md) for new features.
