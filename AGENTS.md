# AI Agent Instructions

This document provides guidance for AI coding assistants working on this repository.

## Primary Goal

Maintain consistency with the existing architecture.

Do not introduce new architectural patterns unless explicitly requested.

---

## Stack

- SvelteKit 2
- Svelte 5 (Runes)
- TypeScript
- TailwindCSS v4

---

## Architecture

Public routes

```
/
blog/
experience/
projects/
```

Internal routes

```
/dev/{company}
/api/*
```

---

## Coding Rules

Always

- follow existing naming conventions
- reuse utilities
- reuse components
- keep files small
- preserve folder structure

Never

- migrate to another framework
- replace existing libraries
- rewrite unrelated files
- introduce state libraries

---

## TypeScript

- strict mode
- prefer interfaces
- use global types
- use `$lib`

---

## Svelte

Always use runes.

Use

- `$state`
- `$derived`
- `$props`

Avoid legacy syntax.

---

## Styling

Prefer existing design tokens.

Do not duplicate utility classes.

---

## APIs

Endpoints live under

```
src/routes/api
```

Return

```
Http<T>
```

Follow existing response shape.

---

## DDE Module

The DDE module is the core business domain.

Changes affecting DDE should preserve

- Google Sheets compatibility
- Google Docs export
- DOCX generation
- existing spreadsheet schema

Avoid changing data structure unless explicitly instructed.

---

## Before Generating Code

Search for similar implementations first.

Prefer consistency over novelty.

When uncertain, match surrounding code style instead of inventing a new approach.
