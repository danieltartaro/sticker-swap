# Spec 02 — Catalog Ingestion (Module 3)

## Goal
Replace the synthetic 670-sticker seed with the real **1,034-sticker** Panini FIFA WC 2026 catalog, sourced from `data/raw/panini-wc-2026-catalog.json` (already extracted in Cowork from laststicker.com — see Decision log).

After this module, opening the app shows real player names, real team rosters, and the count Daniel sees in his physical album.

## Why
Slice 1 proved the architecture. The synthetic seed served its purpose. Module 3 swaps the data source from fake to real without changing the inventory UX. After this, Daniel and his son can do the actual first inventory pass against the real catalog.

This module also introduces the `sortIndex` field we parked when we saw `ARG-BADGE` lexicographically sorting before `ARG01`. With real album-order data in hand, the fix is now cheap.

## Source data
`data/raw/panini-wc-2026-catalog.json`. Shape:

```json
{
  "source": "laststicker.com/cards/panini_world_cup_2026/checklist",
  "scrapedAt": "2026-05-26T...",
  "edition": "Panini FIFA World Cup 2026 - Standard Edition",
  "canonicalCount": 1034,
  "cutoffRule": "Everything up to and including FWC19; regionals start at CC-US1",
  "stickers": [
    { "code": "00", "name": "Panini Logo", "team": "We Are Panini" },
    { "code": "FWC1", "name": "Official Emblem1", "team": "FIFA World Cup 2026" },
    { "code": "FWC6", "name": "Canada", "team": "Host Countries and Cities" },
    { "code": "MEX1", "name": "Emblem", "team": "Mexico" },
    { "code": "MEX2", "name": "Luis Malagón", "team": "Mexico" },
    { "code": "BEL2s", "name": "Thibaut Courtois", "team": "Belgium" }
  ]
}
```

Properties to know:
- Rows are in **album order** — use array index as `sortIndex`. Do not re-sort.
- Codes use team prefixes (`MEX1`, `ARG2`, `BEL10`) plus suffix variants (`BEL2s` for the Germany/Belgium/France bonus subset).
- Special sections use `00` (cover) and `FWC1..FWC19`.
- 52 distinct `team` values; 48 are nations, 4 are meta groups: `We Are Panini`, `FIFA World Cup 2026`, `Host Countries and Cities`, `FIFA World Cup History`.

## Done criteria
- `src/data/catalog.ts` — typed import of the raw JSON, exports raw entries.
- `src/data/inferType.ts` + colocated test — pure function `inferType({code, name, team}) → StickerType`.
- `src/data/transformCatalog.ts` + colocated test — pure function taking raw entries → `Sticker[]` with inferred `type`, `isShiny`, `sortIndex` from array order, `owned: 0`, `reviewed: false`.
- `src/data/types.ts` — `Sticker` gains `sortIndex: number`.
- `src/data/db.ts` — Dexie schema bumped to **v2**, populate hook calls `transformCatalog(rawCatalog)`. Migration strategy per Q2.
- `src/features/inventory/FirstInventory.tsx` — orders by `sortIndex`, not `code`.
- `src/data/seed.ts` and `src/data/seed.test.ts` — delete (or repurpose tests for new transform).
- `CLAUDE.md` data model section updated with `sortIndex`.
- App opens to `0 / 1034`. First sticker is `00 — Panini Logo`. Next is `FWC1 — Official Emblem1`. Argentina chunk shows real player names (Messi, Martínez, etc.).
- `npm run test` + `npm run build` clean.

## Constraints (from CLAUDE.md)
- No new runtime dependencies. Catalog ships bundled.
- Local-first, offline-only.
- Functional React + hooks. Tests colocated.

## Out of scope
- Image URLs / sticker thumbnails (still no images in v1).
- Slice 2 inventory UX (swipe, undo, skip, polished done state) — that's spec 03.
- Camera scanner — Module 8.
- Multi-device sync — Module 9.
- Stat dashboards / completion %.

## Open questions (decide in plan mode, not pre-decided)

**Q1. Type inference rules — `StickerType` from raw entry.**
The raw data has only `code/name/team`. We need to map to our union (`player | badge | legend | special | group`). Suggested rules:

- `team === 'We Are Panini'` → `'special'` (the `00` cover)
- `team === 'FIFA World Cup 2026'` → `'special'` (emblem, mascots, slogan, ball)
- `team === 'Host Countries and Cities'` → `'special'`
- `team === 'FIFA World Cup History'` → `'legend'`
- `name === 'Emblem'` and `code` matches `^[A-Z]{2,4}1$` → `'badge'`
- `name === 'Team Photo'` → `'group'`
- Everything else → `'player'`

Push back on rules that feel wrong (spot-check 5-10 entries). Codify as a pure function with tests.

**Q2. Migration strategy from existing v1 (synthetic) Dexie data.**
Daniel's browser has the synthetic 670-row DB, possibly with test taps. Three options:

- **(a) Wipe + reseed on schema bump.** Loses Daniel's test decisions (which are throwaway anyway). Simplest. **Recommended.**
- **(b) Migrate manually:** keep `owned/reviewed` for codes that still exist, drop orphans, add new codes as `owned: 0, reviewed: false`. Generalizable, code overhead.
- **(c) Dexie upgrade hook:** same as (b) but using Dexie's primitive.

Pick one, document the call in code (`// Schema v2: catalog replaced; v1 dev data discarded`).

**Q3. `isShiny` inference.**
Real Panini team badges are foil. Two options:

- (a) Any `type === 'badge'` → `isShiny: true`.
- (b) Don't infer; leave `undefined` until we have authoritative source data.

Pick one.

**Q4. Bonus stickers (`BEL2s`, etc.).**
These are the Germany/Belgium/France +18 extras. Lexicographically they'd land in weird positions (`BEL20` < `BEL2s` because `2` < `s`). With `sortIndex` from JSON array order, this is moot — they appear where laststicker.com put them. No decision needed unless plan mode finds a wrinkle.

## Suggested first slice
The whole spec is the slice — Module 3 is smaller than slice 1 because we're swapping a data source, not building a UI from scratch.

1. `src/data/catalog.ts` — typed JSON import.
2. `src/data/inferType.ts` + test.
3. `src/data/transformCatalog.ts` + test.
4. Add `sortIndex` to `src/data/types.ts`.
5. Bump `src/data/db.ts` to schema v2; wire transform into populate.
6. Update `FirstInventory.tsx` to order by `sortIndex`.
7. Delete the synthetic seed files.
8. Update CLAUDE.md.

## How to use this spec in Claude Code

In a fresh Claude Code session in this repo:

```
Read @specs/02-catalog-ingestion.md, @CLAUDE.md, and @data/raw/panini-wc-2026-catalog.json.
Enter plan mode.
Propose a plan for the full spec (it's smaller than slice 1 — single slice is fine).
Stop after the plan — do not write code yet.
```

When the plan comes back, review with the same rigor as slice 1:

- **Q1 explicitly addressed** — type inference rules listed, ideally with sample mappings shown.
- **Q2 decision made and justified** — which migration strategy, why.
- **Q3 decision made** — shiny on badges or not.
- **Test plan that actually exercises `inferType` and `transformCatalog`** — these are the functions most likely to silently produce wrong data.
- **Verification step that confirms `1034` shows in the counter, not `670` or some other number.**

Approve → execute → diff-review.

## Decision log
- 2026-05-26 — chose **all 1034** (full canonical), not 980. Includes the Germany/Belgium/France +18 bonus subset. Reason: simplicity — at a swap event, any printed code should be lookup-able in one tap.
- 2026-05-26 — source: laststicker.com checklist page. Extracted via Cowork's Chrome session (laststicker is Cloudflare-gated; Claude Code's terminal session can't easily fetch it).
- 2026-05-26 — JSON bundled in build, not fetched at runtime. ~30KB gzipped — well under any threshold worth optimizing for.
- (add subsequent decisions here as the spec evolves)
