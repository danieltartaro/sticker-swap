# Sticker Swap App

> Read [`../../DOCTRINE.md`](../../DOCTRINE.md) first. Domain rules below build on it. Portfolio inheritance question (whether to also chain through [`../CLAUDE.md`](../CLAUDE.md), the public-products cross-product contract) is open — flagged at folder-move time, decide at next session.

## What this is
A PWA for tracking Daniel & son's FIFA World Cup 2026 Panini sticker collection. The killer use case is **browse-by-country with tap-to-mark at swap events**: pick a country in the picker, see what you're missing in a 2-column grid, tap "Got it" to mark a sticker as Have. Fully offline. A guided first-inventory pass (Need / Have, with arrow-rewind) seeds the collection before swap day.

> Killer-feature reversal note: the original killer use case was type-a-code Lookup with a `<50ms` keypress→result contract. Retired 2026-05-28 per doctrine §4.12; see [`specs/07-killer-feature-reversal.md`](specs/07-killer-feature-reversal.md) and `journal/log.md` session 6.

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS (utility-first), with FIFA 26 design tokens layered on top via `src/styles/tokens.css` — see [`specs/05-design-system.md`](specs/05-design-system.md) for the full spec (palette, typography, primitives, layout).
- `@fontsource/archivo-black` — display digit face, ships bundled (offline-safe)
- Dexie.js (IndexedDB wrapper) — local sticker inventory
- Zustand — UI state (current view, search query, settings)
- vite-plugin-pwa — service worker, web manifest, install prompt
- Vitest — unit tests

## Data model (canonical)
```ts
type Sticker = {
  code: string;           // primary key, e.g. "MEX5", "FWC1", "GER2s"
  type: 'player' | 'badge' | 'legend' | 'special' | 'group';
  team?: string;          // e.g. "Brazil"; undefined for non-team stickers (specials, legends)
  name?: string;          // descriptive label: player name, "Panini Logo", "Brazil 1994", "Emblem", "Team Photo"
  isShiny?: boolean;
  owned: number;          // 0 = need, 1 = have. >=2 unused — dupe concept retired in Module 7 per §4.12.
  reviewed: boolean;      // false until decided in the first-inventory pass
  sortIndex: number;      // array index from canonical catalog; preserves album order
};
```

`reviewed` distinguishes "unseen" from "decided need" — both would otherwise collapse to `owned: 0`. Keeping it as a separate boolean avoids overloading `owned` with a sentinel and keeps the field meaningful for downstream consumers (lookup, trade) that don't care about review state.

`isShiny` is set when `type === 'badge'`. Panini foil-stamps every nation Emblem; that is the only universally-printed shiny in this app's default (Singapore) edition — 980 stickers, 48 shinies. The bundled catalog also carries 54 `s`-suffix player codes — the Germany / Belgium / France bonus shinies from the European edition — exposed via `transformCatalog(rawCatalog, { includeShinies: true })` (1,034 stickers, 102 shinies). Codes ending in `s` only appear when that flag is on; their `isShiny` is then also true.

## Folder map
- `src/data/` — Dexie schema, seed loader, sticker types
- `src/features/country-browse/` — country picker + missing-sticker grid (killer feature)
- `src/features/inventory/` — Welcome screen + guided first-inventory pass (Need / Have, arrow-rewind, Reset)
- `src/components/` — shared UI primitives (Card, GridCard, ActionButton, ConfirmDialog, ScreenLayout, etc.)
- `specs/` — feature briefs written outside Claude Code, used as starting prompts for plan-mode sessions. Read the relevant `specs/NN-*.md` before planning. Numbered in build order.
- `mocks/` — visual source-of-truth PNGs (`07-*.png`) and `.reference.tsx` files captured 2026-05-28. PNG wins when spec prose disagrees. `.reference.tsx` files are not imported by production; they exist as copy-paste sources to defeat Tailwind-class drift during visual fidelity work. macOS Screenshot filenames embed a NARROW NO-BREAK SPACE (U+202F) between "Screenshot" and the date — always quote / escape in any scripted file handling.
- `public/` — PWA icon set + source SVG. Regenerate with `npx @vite-pwa/assets-generator --preset minimal-2023 public/icon-source.svg` after editing `icon-source.svg`. Output files (`pwa-*.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`) are committed.

## Conventions
- Functional React + hooks. No class components.
- Tailwind utilities inline; no separate CSS files except `index.css` (Tailwind directives only).
- Tests colocated: `Foo.tsx` + `Foo.test.tsx`.
- Type everything. `any` requires a `// FIXME: any` comment with a reason.
- One feature = one folder under `src/features/`. Avoid cross-feature imports.

## What NOT to do
- Don't add server-side state until Module 9 (sync). Local-first stays local-first.
- Don't add a heavy state library (Redux, RTK). Zustand only.
- Don't fetch sticker checklist data at runtime — it ships bundled.
- Don't introduce a UI framework (MUI, Chakra, etc.). Tailwind primitives + a few hand-rolled components.

## Useful commands
- `npm run dev` — start Vite dev server (http://localhost:5173)
- `npm run build` — production build (also generates the service worker)
- `npm run preview` — serve the built PWA locally (use this to test offline)
- `npm run test` — Vitest

## Session ritual

Per doctrine §7. Same pattern as school-agent / dbrain, scoped to this folder.

**Open trigger phrases** (any variant): "lets work on stickers", "sticker session", "stickers session", "let's work on the sticker app". Respond with the doctrine §7 three-part snapshot in under 10 lines BEFORE any other work:
1. **Overall** — current phase, last-locked decision. One line.
2. **Last session** — one-line summary of the most recent `journal/log.md` entry.
3. **This session (planned)** — top items from the last entry's `### Open queue going into N+1`.

Then wait for Daniel's signal — confirm the planned scope or redirect.

**Close trigger phrases**: "wrap up", "wrap session", "log session", "let's wrap". Log before any further reply, per doctrine §7 close protocol: append entry to `journal/log.md` (newest at top), append to `learnings.md` if new lessons landed, update CLAUDE.md only if current state changed, confirm to Daniel in 1-2 lines.

## Doctrine notes (what applies here)

This project is a personal toy / learning artifact, slated for open-source. Not a Winnin client deliverable. Skillify-stakes tier: currently "one-shot experiment" → graduating to "shipped to other users" the moment we push to GitHub. That gradient matters — the test/eval bar tightens once it's public.

**Load-bearing doctrine sections for this folder:**

- **§4.2 probe runtime, §4.3 no assumed state** — already burned us once (assumed 670 stickers; reality is 1,034). Always verify counts and external state empirically before encoding.
- **§4.10 universal hygiene** — Brasil-with-S is muted in data files (source is English, preserve as ingested); applies in Daniel-authored prose. **Emoji rule explicitly overridden for this project (Daniel call, 2026-05-26)** — decorative emojis allowed in docs (MASTERCLASS.md, specs/*.md, etc.) since this is a personal/learning artifact. No-secrets and prose-where-prose-fits still apply.
- **§4.11 acceptance ≠ fault-finding** — when Daniel reports "works on my phone," light verification, not an audit.
- **§4.12 prior calls stand** — every decision in `specs/*.md` and `journal/log.md` is settled until explicitly revisited. New contradicting evidence triggers "this may invalidate decision X — should we revisit?", not silent re-framing. *Example:* Module 7 (2026-05-28) retired the entire Lookup feature under §4.12 — spec `specs/07-killer-feature-reversal.md` + journal session 6 carry the full reasoning and the locked decisions.
- **§4.14 optimization function probe** — sticker-swap's optimization function is *use it at a swap event today + give Reddit collectors a clean JSON*. Architecture / vendor calls are evaluated against that, not against generic best practices.
- **§5 cost discipline** — Claude Code work defaults to Workhorse-tier. Premium only for architecture decisions. Catalog JSON is Fat Data (compounding asset, ships bundled).
- **§7 session ritual** — open / close triggers above.

**Dormant for this folder (do not invoke):**
- §3 skillify loop — no skills in this project.
- §6.1, §6.2, §6.5, §6.6 — no skills / brain to audit.

## How to extend this file
When something becomes a recurring source of confusion or a load-bearing decision, add it here. CLAUDE.md is the contract every Claude Code session inherits. Keep it tight (<200 lines). When it gets too dense, split topics into `docs/` and link.
