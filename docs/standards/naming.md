# Naming conventions

Status: Draft

- Use domain language from approved feature documents.
- TypeScript files and folders use lowercase kebab-case.
- Components, types, and classes use PascalCase.
- Functions, variables, hooks, and object properties use camelCase.
- Hooks begin with `use`; boolean names begin with `is`, `has`, `can`, or
  another truth-describing verb.
- Constants use camelCase unless they are environment names or true protocol
  constants.
- Interfaces/types name domain meaning, not implementation (`ProviderConnection`,
  not `ProviderConnectionData`).
- Commands use imperative intent; events use past tense; queries state what they
  return.
- Permission names use stable `<resource>.<action>` vocabulary.
- Routes use plural kebab-case nouns; JSON uses camelCase; database uses
  snake_case.
- Provider-native terms are prefixed or scoped when they differ from Harbor
  normalized terms.
- Avoid `manager`, `helper`, `util`, `common`, `data`, and `service` without a
  precise domain qualifier.
- Acronyms are treated as words (`ApiClient`, `GithubConnection`) except official
  product spelling in user-facing text (`GitHub`).

Renaming public APIs, persistent fields, permissions, metrics, or event types is
a compatibility change, not cosmetic cleanup.
