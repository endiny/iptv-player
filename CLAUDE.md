# IPTV Player — Repo Context

## Tech Stack
- React 19, TypeScript 5.9 (strict), Vite 7 (rolldown), Tailwind CSS 4
- Zustand for state management, HLS.js for video, React Router 7
- shadcn/ui + Radix UI for UI primitives

## Branch Workflow
- All new features must go on a `feature/` branch — never commit directly to `main`

## Before Every Commit
Run these two commands and fix any issues before committing:
```
npm run format   # Prettier autofix
npm run lint     # ESLint check
```

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint (no autofix) |
| `npm run format` | Prettier autofix (all files) |
| `npm run format:check` | Prettier check (CI-safe, no writes) |

## Code Style
- Prettier enforced: single quotes, semicolons, `trailingComma: all`, `printWidth: 100`
- ESLint: typescript-eslint strict + react-hooks + react-refresh; `eslint-config-prettier` disables formatting rules
- No comments unless the WHY is non-obvious
- No extra abstractions beyond what the task requires

## Source Structure
Feature folders under `src/`: `player/`, `playlist-view/`, `settings/`, `stores/`, `icons/`.
Global state lives in Zustand stores. Shared utilities stay co-located with the feature that owns them.

## Path Alias
`@/` resolves to `src/` (configured in tsconfig and vite.config.ts).
