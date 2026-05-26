# Spec 03 — Lookup Screen (Module 4)

## Goal
The killer feature. At a swap event, the user types a sticker code and gets an instant **HAVE / NEED / DUPE** answer offline, plus one-tap inventory update from the same screen. Performance target stands: <50ms keypress-to-result.

This is what the whole performance contract was built to serve. Everything in Modules 1-3 is infrastructure for this.

## Why
Without lookup, the app is a checklist. With it, it's the thing Daniel reaches for at a swap table. The user flow is:

1. Another collector shows Daniel a sticker — "I have FRA17, want to trade?"
2. Daniel pulls out phone, opens the PWA (Module 5 makes it installable)
3. Lookup screen is the default view (because first inventory is complete by then)
4. Daniel types `FRA17`
5. As soon as the 5th character lands, the result appears: NEED, with player name and team
6. Daniel makes the trade
7. Daniel taps "now I have it" — Dexie writes, input clears, ready for the next lookup
8. Total time from "show me the sticker" to "trade decided + inventory updated": ~3 seconds

## Done criteria
- New file `src/features/lookup/LookupScreen.tsx` implementing the screen.
- New Zustand store at `src/store/view.ts` (or inline in `App.tsx`) with `view: 'first-inventory' | 'lookup'` and `setView`.
- `App.tsx` updated: on mount, query Dexie for inventory completion. If all stickers `reviewed === true` → `setView('lookup')`. Else → `setView('first-inventory')`. Render the chosen view.
- LookupScreen layout:
  - Input field at top, autofocus on mount, large enough for thumb (min height 48px)
  - As user types, real-time exact match against a code → result appears the moment all characters match an existing sticker code
  - No match: gentle "No code matches" text below input, input NOT auto-cleared (so user can correct typos)
  - Result card: large code, team, name, shiny indicator if applicable, plus a big color-coded **HAVE / NEED / DUPE +N** indicator
  - Context-aware quick toggle buttons below result:
    - If NEED (owned=0): single "Now I have it" button → sets `owned: 1`
    - If HAVE (owned=1): "Got a dupe" → sets `owned: 2`
    - If DUPE (owned≥2): "Got another dupe" → increments; "Gave one away" → decrements (min 1, doesn't go back to 0 via this action — that's an inventory-mode operation)
  - On any toggle action: write to Dexie, update UI, clear input, refocus input
- Color treatment (per doctrine §4.10, no decorative emojis; use text + background color):
  - HAVE → emerald (matches existing Have button)
  - NEED → slate-700 with red text accent (warning without alarm)
  - DUPE → amber (matches existing Dupe button)
- Lookup performance: O(1) per keystroke. Build a `Map<code, Sticker>` once via `useMemo` keyed on the stickers array; subsequent lookups are hash lookups, not array scans.
- `npm run test` + `npm run build` clean.
- Manual smoke: type 20 codes in a row on the phone, none should feel slow. Result must appear within the keypress's paint cycle.

## Constraints (from CLAUDE.md)
- <50ms keypress-to-result.
- Local-first, offline-only.
- No new runtime dependencies (Zustand and Dexie already in package.json).
- Functional React + hooks.
- No decorative emojis in code/UI strings (§4.10). Color and typography do the work.

## Out of scope (do NOT build in this slice)
- Camera/photo scanner — Module 8.
- Voice input.
- Prefix autocomplete or fuzzy match (explicitly rejected: real-time exact match only).
- Search by player name (lookup is by CODE — that's what's printed on the sticker).
- History of recent lookups.
- Animated screen transitions between inventory and lookup.
- Settings screen / preferences toggles.
- Manual "go back to first inventory mode" button after inventory is complete (assume done = done for v1).
- Editing the catalog itself.

If Claude proposes any of these in the plan, push back.

## Open questions (decide in plan mode)

**Q1. View switching plumbing.**
Spec 01 promised "Zustand-driven view atom" rather than a router. Confirm the plan creates `src/store/view.ts` (or equivalent) with a Zustand store and `App.tsx` reads it to render the right component. Manual view switching UI is OUT OF SCOPE for v1 — the smart default (inventory until done, lookup after) is enough.

**Q2. Inventory-completion check on mount.**
Cheapest correct query: `await db.stickers.where('reviewed').equals(0).count() === 0` (Dexie booleans store as 0/1 with the secondary index from schema v1+). Alternative: `await db.stickers.count() === await db.stickers.where('reviewed').equals(1).count()`. Pick the first one — single indexed query, no math, returns boolean directly.

**Q3. The lookup Map data flow.**
Where does the `Map<code, Sticker>` live? Options:
- (a) `useMemo` inside LookupScreen, depends on stickers loaded from Dexie. Stickers reloaded once on mount; Map built once.
- (b) Module-scoped singleton, rebuilt on demand.
- (c) Computed in a custom hook `useStickerLookup()`.

Pick (a) for v1 — simplest, scoped to the component lifecycle, no global state surface. If we add a second consumer later, refactor to (c).

**Q4. Input field controlled vs uncontrolled.**
Must be controlled — we want to clear it programmatically after a toggle action. State lives in LookupScreen.

**Q5. Refocus after toggle.**
After tapping a quick toggle, refocus the input so the next code can be typed immediately. Use a ref + `ref.current.focus()` in the toggle handler. Mobile Safari may need a brief delay (`setTimeout(..., 0)`) — note this in the plan if the plan-mode probe hits the issue, otherwise don't pre-optimize.

**Q6. Test coverage.**
At minimum, a pure-function test for the toggle logic (given owned=N, action X, output owned=M). The view-selection logic (`inventoryDone ? 'lookup' : 'first-inventory'`) can be extracted as a pure function and tested. React-component tests still out per slice-1 ground rule (3 new devDeps not worth it for v1).

## Suggested first slice
The whole spec is the slice. Estimated 45-60 minutes of Claude Code work.

1. `src/store/view.ts` — Zustand atom with `view` + `setView`.
2. `src/features/lookup/LookupScreen.tsx` — full screen, input + result + toggles.
3. `src/features/lookup/lookupLogic.ts` — pure function `nextOwned(currentOwned, action)` + colocated test.
4. `src/features/lookup/inventoryDone.ts` — pure function over a Dexie count + colocated test.
5. Update `src/App.tsx` — on mount, query completion, set view, render LookupScreen or FirstInventory.
6. Update `CLAUDE.md` folder map — add `src/features/lookup/`.

## How to use this spec in Claude Code

In a fresh Claude Code session in this repo:

```
Read @specs/03-lookup-screen.md, @CLAUDE.md, @journal/log.md (head only), 
@src/features/inventory/FirstInventory.tsx (reference for layout patterns), 
and @src/data/db.ts (reference for Dexie query patterns).

Enter plan mode.
Propose a plan for the full spec — it's a single slice.
Stop after the plan — do not write code yet.
```

Review with the same rigor as Modules 1-3:

- **Q1-Q6 explicitly addressed** in a Decisions section. If any are silently skipped, push back.
- **The lookup performance claim** — does the plan actually use the Map for O(1) lookup, or is it doing `stickers.find(s => s.code === input)` in the keystroke handler? The latter is O(n) and violates the perf contract.
- **The toggle logic test** — is the test fed all five interesting cases (owned=0 + "now I have it" → 1; owned=1 + "got a dupe" → 2; owned=2 + "got another" → 3; owned=2 + "gave one away" → 1; owned=3 + "gave one away" → 2)?
- **Out-of-scope adherence** — no autocomplete sneaking in, no animations, no manual view-switch button.

Approve → execute → diff-review.

## Decision log
- 2026-05-26 — Entry method: native mobile keyboard with autofocus (rejected custom button-pad, rejected voice).
- 2026-05-26 — Match strategy: real-time exact match only (rejected prefix autocomplete, rejected fuzzy match — false-positive risk at swap table).
- 2026-05-26 — Result actions: read + quick toggle (rejected read-only, rejected full inventory controls). Context-aware buttons based on current `owned` value.
- 2026-05-26 — View switching: Zustand atom, smart default (inventory until done → lookup after). No manual switch UI in v1.
- (add subsequent decisions here as the spec evolves)
