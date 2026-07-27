# Skill — Harbor React and Next.js UI

## Purpose

Build accessible, server-first Harbor interfaces that reflect approved feature
and authorization contracts with minimal client complexity.

## Principles

Server Components by default; narrow client islands; URL for shareable state;
remote state is not duplicated; composition over generic configuration; all
states are designed; UI is not authorization.

## Required context

Feature UI/API/permission contract, frontend architecture, current Next.js
repository docs, shadcn/Tailwind conventions, existing components, accessibility
target, performance budget, and test strategy.

## Workflow

1. Map route, user task, data, permissions, and all visual states.
2. Choose server versus client ownership per interaction.
3. Reuse feature/shared primitives with correct semantic structure.
4. Implement forms with aligned schemas and accessible errors.
5. Verify responsive, keyboard, focus, loading, stale, partial, failure, and
   concurrency behavior.
6. Measure bundle/render impact and test critical interactions.

## Output format

Component/route plan, server-client boundary, state matrix, accessibility notes,
data/error flow, changed files, tests, performance evidence, and screenshots
when requested.

## Things to avoid

Large `"use client"` trees, client database/provider access, client-only
permission checks, global state without need, demo data, div-only semantics,
color-only status, hidden errors, and speculative design systems.

## Quality checklist

- [ ] Server/client boundary is minimal and secure.
- [ ] All states and authorization-aware experiences are present.
- [ ] Keyboard, focus, labels, headings, and live feedback are correct.
- [ ] URL/query/form/local state have clear owners.
- [ ] Responsive, test, and performance criteria pass.
