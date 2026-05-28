# Spec 07 — Killer Feature Reversal (Module 7)

## Goal
Reframe the app's killer use case. Type-a-code Lookup (Module 4) is gone; the new killer feature is **browse-by-country with tap-to-mark**. Bridge changes: a new Welcome screen at first launch, a restructured FirstInventory pass that loses Dupe and gains arrow-rewind + Reset, and the deletion of `src/features/lookup/`.

This spec consolidates fourteen design decisions locked across two Cowork mock-iteration rounds on 2026-05-28. Every locked decision is non-negotiable; remaining open questions are flagged in `## Open questions`.

## Why
A §4.12 reversal of the load-bearing CLAUDE.md framing. The original killer use case ("instant offline lookup at swap events: type or scan a sticker code, get an immediate ✅ HAVE / ❌ NEED / 🔄 DUPE answer") and its `<50ms keypress→result` performance contract are retired.

Daniel's call after seeing the country-browse mockup. Rationale to be documented in the journal §4.12 entry written during slice 4 — the working hypothesis is that browsing-by-country at a swap table beats typing codes on a phone keyboard when kids are handling stickers, and that the dupe-tracking surface area never earned its complexity.

Two-surface framing from spec 05 still holds. The operational surface gets two new screens (Welcome, Country Browse) and one restructured screen (FirstInventory). The brand surface (icon, manifest splash, palette) is unchanged.

Architectural payoff: deleting Lookup drops a feature folder, the keyboard-driven hot path, and the `<50ms` perf budget. Country Browse pulls from the same Dexie store with a code-prefix filter — no new indexing needed. The data model's `owned: number` becomes effectively binary (0 or 1); no schema change required, but the comment in `src/data/types.ts` gets updated.

## Locked decisions (do NOT relitigate)

Each came out of a 3- or 4-option exercise in Cowork. Settled per CLAUDE.md §4.12.

1. **Killer feature reframed.** Country Browse with tap-to-mark replaces type-a-code Lookup. CLAUDE.md "What this is" and "Performance contract" sections rewritten in slice 4.
2. **Dupe concept erased from the UI.** First pass = Need / Have only. Country Browse never sees an owned sticker. The `owned` field in the data model stays a number but no code path ever sets it to ≥2. No "X2" badge, no "Got a dupe" button, no dupes in the JSON export schema.
3. **No "lost / unmark Have" path in Module 7.** A user who decides Have on a sticker can't undo that decision short of full Reset. Acceptable for v1.
4. **Welcome screen.** New view. Shown on first launch (no decisions yet) and after Reset. Mid-pass resumes FirstInventory directly. Pass-complete routes to Country Browse.
5. **Position counter on FirstInventory.** Counter shows `currentIndex+1 / total`, not reviewed count. Moves with arrows AND with decisions.
6. **Linear-with-rewind arrows.** Left arrow visible when `currentIndex > 0`. Right arrow visible when `currentIndex < furthestIndex`. Decisions (Need/Have) are the only way to advance the leading edge. Right arrow does NOT advance past furthestIndex.
7. **Reset inventory.** Full wipe (owned=0, reviewed=false on every sticker) → confirm modal → bounce to Welcome. Confirm modal is dark slate card with cancel (outlined) + destructive confirm (fifa-red) buttons.
8. **Country picker is a bottom-sheet overlay.** Opens automatically on entry to Country Browse (no default country). 48 nations + 1 "Specials" pseudo-country = 49 rows. Each row: jersey-color swatch + name + missing-count (green "complete" when 0). Order: Specials pinned to top of the incomplete bucket; then most missing first; tie-break alphabetical; completed countries fall to bottom at 50% opacity (Specials falls into that bucket alphabetically when complete). Swatch gets a 1px border when its color is within visual ε of the picker background (e.g. Germany). *Lock 8 amendment (2026-05-28, post-slice-4 smoke):* originally "most missing first; completed to bottom" — under Lock 9 amendment B, Specials and a fresh country can tie on missing count, and alphabetical tie-break put Specials between R and T (after Senegal-South-Africa, before Tunisia). Daniel called for Specials to read as a meta category at the top of the list, so it's now explicitly pinned ahead of every country when incomplete.
9. **Specials pseudo-country.** Aggregates the tournament-wide FWC* stickers: type `'special'` and `'legend'` only. Swatch is fifa-violet with a white star icon overlaid. No team stripe on its grid cards. *Lock 9 amendment A (2026-05-28, post-slice-4 smoke):* originally locked as fifa-red; on iPhone the red field + centered white star read as the Vietnam flag. Switched to fifa-violet (`#9B5BD2`) — purple is uniquely absent from every national flag, so no false-positive flag mimicry at thumbnail scale. *Lock 9 amendment B (2026-05-28, same smoke):* originally aggregated `'special' | 'legend' | 'group'`. Wrong — `'group'` is the team-photo type (BRA13, MEX13, …), which is country-attributable and belongs under each team's grid. Specials now matches `'special' | 'legend'` only. Effect: each country gains its team-photo sticker (+1 missing); Specials count drops by ~48 (one team photo per nation).
10. **Default landing.** Country Browse opens with picker already up. No persisted last-country (revisit in next module if needed).
11. **Compact Card variant.** Country Browse grid reuses the existing `Card` primitive. Either add a `size: 'lg' | 'md'` prop or wrap in a `GridCard` component — implementation choice during plan mode. 2-col grid, ~152px tall per card. Includes jersey stripe (if applicable), sticker code (~22-24px), name, type pill, and a full-width "Got it" button.
12. **Got it button.** Inside the compact card. fifa-green (`#2BAA4F`, intent `have`). Maps to existing HAVE write: `{ owned: 1, reviewed: true }`. Tap → 220ms opacity+scale fade → card removed from grid + DOM. Underlying Dexie update happens synchronously before the fade.
13. **Link color treatment.** Navigational text links (Country Selector, country name when selected) = white `#F8FAFC` underlined. Destructive text links (Reset inventory) = fifa-red `#D7232A` underlined. The yellow used in earlier mock rounds was Daniel's "this is changing" highlight, not a locked color.
14. **Arrow color in FirstInventory.** Neutral. Pick between white (`#F8FAFC`) and muted gray (`#94A3B8`) in plan mode based on visual hierarchy against the Need/Have buttons.

## Routing model

New view enum (in `src/store/view.ts`):
```ts
type View = 'welcome' | 'firstInventory' | 'countryBrowse';
```
Removed: `'lookup'`.

Routing at app entry:
1. Load DB. Count `reviewed=true` stickers.
2. If `reviewed === 0` → `'welcome'`.
3. If `0 < reviewed < total` → `'firstInventory'` (resume at first non-reviewed, per existing logic).
4. If `reviewed === total` → `'countryBrowse'` (picker auto-opens).

Manual transitions:
- Welcome "Start first inventory pass" → `'firstInventory'`.
- FirstInventory "All done — Start swapping" → `'countryBrowse'`.
- FirstInventory "Reset inventory" → confirm dialog → wipe DB → `'welcome'`.
- Country Browse: no view exits. User taps the country selector to switch country, or Got it to record Have.

## Component changes

### New: `<Welcome>` — `src/features/inventory/Welcome.tsx`
Single screen. Centered title block (sticker count + 1-line framing), bottom-anchored fifa-green CTA "Start first inventory pass". Uses `ScreenLayout`-like 3-zone composition but the middle zone is the title block, not a Card. Plan mode picks whether to extend `ScreenLayout` or hand-roll a `WelcomeLayout`.

### Modified: `<FirstInventory>` — `src/features/inventory/FirstInventory.tsx`
- Drop the `dupe` branch from `handleAction`.
- Drop the 3-button grid; replace with 2-button (`grid-cols-2`) Need/Have.
- Add `furthestIndex: number` state alongside `currentIndex`.
- Add an arrow-nav row between the Card and the action buttons (inside the `actions` slot, or as a new slot in `ScreenLayout`). Left/right arrow buttons follow visibility rules per lock 6.
- Add a "Reset inventory" text link inside the `counter` slot, below the position+total line. fifa-red underlined.
- Change counter semantics: `{currentIndex + 1} / {total}` (not `reviewedCount / total`).
- On Reset confirm: wipe DB via `db.stickers.clear()` + reseed from catalog, then `setView('welcome')`.

### New: `<ConfirmDialog>` — `src/components/ConfirmDialog.tsx`
Reusable modal. Props: `open`, `title`, `body`, `cancelLabel`, `confirmLabel`, `onCancel`, `onConfirm`, `confirmIntent?: 'subtract' | 'have'` (defaults `subtract` for destructive). Backdrop = `rgba(0,0,0,0.65)`. Card = `var(--color-bg-card)` with `rounded-2xl`, centered. No `position: fixed` — use `absolute` inside the screen's container or a portal at the layout root.

### New: `<CountryBrowse>` — `src/features/country-browse/CountryBrowse.tsx`
Top-level screen for the new killer feature. Composition:
- Header: white underlined link ("Country Selector" when no country picked, country name otherwise) + small `MISSING / TOTAL` summary below in muted text.
- Body: 2-col grid of `GridCard`s (or `<Card size="md">`), one per missing sticker. Scrolls within the available height.
- Picker overlay: bottom sheet on top of the body when open. Opens automatically on first mount.

State:
- `selectedCode: CountryCode | 'SPE' | null`
- `pickerOpen: boolean` (auto-true on mount when `selectedCode === null`)
- Stickers fetched from Dexie filtered by `owned === 0 && code.startsWith(prefix)`. Specials prefix logic: codes matching `^FWC\d+` and any sticker with `type === 'legend' | 'special'`. (Originally included `'group'`; amended per Lock 9 amendment B — team photos are country-attributable and stay under their nation.)

### New: `<CountryPicker>` — `src/features/country-browse/CountryPicker.tsx`
Bottom-sheet list. Slides up from bottom (CSS transform; 220ms ease-out). Header: drag handle + "Pick a country" title + "Close" button. Body: scrollable list of 49 rows. Each row:
```
[24×24 swatch]  Name             X missing  ›
```
Swatch background = `JERSEY_PRIMARY[code]`; if the swatch hex is within ε of `--color-bg-card`, add a `1px solid var(--color-text-dim)` border. Specials row's swatch is `var(--color-fifa-violet)` with a Tabler `star-filled` icon overlaid in white. (Lock 9 amendment — original fifa-red read as Vietnam flag on iPhone smoke.)

Sort: most missing first; tie-break alphabetical. Completed countries (`missing === 0`) clamped to bottom, opacity 0.5, count label "complete" in fifa-green.

Tap a row → `setSelectedCode(code)` + `setPickerOpen(false)`. The picker also closes via the explicit "Close" button or backdrop tap (only when a country is already selected — first-mount auto-open is dismissable but defaults to "you must pick something").

### New: `<GridCard>` — `src/components/GridCard.tsx` (or extend Card)
Compact variant. Same visual atoms as `Card`: optional jersey stripe (top 4px), sticker code (mono ~22px), name (text-muted ~11px), type pill, optional shiny chrome frame. Adds: a full-width 32px fifa-green "Got it" button at the bottom.

Two implementation paths — pick in plan mode:
- (a) Extend `Card` with `size?: 'lg' | 'md'` prop and an optional `actionSlot?: ReactNode` for the button. Single component, two appearances.
- (b) New `GridCard` that composes the existing primitives (`StickerCode`, `TypePill`, `TeamStripe`, `ChromeFrame`) directly. Two components, no prop overloading.

(a) is DRYer. (b) keeps `Card` simple for FirstInventory's hero context.

### Deleted: `src/features/lookup/`
Entire folder. Includes `LookupScreen.tsx`, `lookupLogic.ts`, any colocated tests. Also remove imports from `App.tsx` and the view-router.

### Modified: `src/store/view.ts`
Drop `'lookup'` from the View union. Add `'welcome'` and `'countryBrowse'`. Update any consumer that references the old enum.

### Modified: `CLAUDE.md`
- **"What this is"** section: rewrite. New first paragraph leads with country-browse as the killer feature.
- **"Performance contract"** section: delete entirely (lookup-latency target is moot).
- **"Data model"** code block: update the `owned` field comment from `// 0 = need, 1 = have, 2+ = dupes (tradeable)` to `// 0 = need, 1 = have. >=2 unused — dupe concept retired in Module 7 per §4.12.`
- **"Folder map"** section: remove `src/features/lookup/` line; add `src/features/country-browse/` line.
- **"What NOT to do"** section: remove the "until Module 9 (sync)" line if it's no longer accurate after this reversal — or keep and add a note that Module 9 (sync) is also affected.
- **Doctrine notes**: add a §4.12 reversal note pointing to this spec + the journal entry.

### Modified: `journal/log.md`
Append a session 6 entry documenting the killer-feature reversal. Capture: what changed, why (Daniel's call after country-browse mockup), what was deleted, doctrine §4.12 process honored.

### Modified: `src/data/types.ts`
Update the `owned` field comment as above. No schema change.

### Modified: `src/components/ActionButton.tsx`
No change required this module — the `dupe` and `subtract` intents stay in the type union (still used by `ConfirmDialog` for the destructive confirm). The unused `dupe` intent can be cleaned up in a future refactor.

## Done criteria
- View enum updated; `'lookup'` removed everywhere; build clean.
- Welcome screen renders at first launch and after Reset; never on resume mid-pass.
- FirstInventory shows 2 buttons (Need/Have), arrows when visibility rules say so, Reset link below the counter, position counter `{i+1} / {total}`.
- Reset → confirm dialog → wipe + reseed Dexie → land on Welcome. No orphan data.
- FirstInventory done state routes to Country Browse, not Lookup.
- Country Browse opens with picker overlay; selecting a country shows only `owned===0` stickers in a 2-col grid.
- Specials pseudo-country shows all non-country stickers in the same layout (no team stripe).
- Tap Got it → 220ms fade → card removed from DOM; Dexie reflects `owned: 1, reviewed: true`.
- `src/features/lookup/` deleted; `grep -r "lookup" src/` returns zero or only-comment matches.
- CLAUDE.md updated per the §Modified list. Journal entry written.
- All tests green. Build clean. `dist/` < 320 KB (current 306 KB + tolerance).
- iPhone smoke: full flow Welcome → first pass → done → Country Browse → pick Brazil → Got it on 2 stickers → reopen picker → Specials → Got it → all writes persist after PWA reload.

## Out of scope (do NOT build)
- "Lost a sticker" / unmark-as-have flow. Reset is the only undo path in v1.
- Persisted last-country in Country Browse. Picker always auto-opens.
- All-done celebratory polish on FirstInventory. Spec 06 still holds it.
- Color-collision team-text labels on missing-grid cards. Spec 06 still holds it.
- Animation beyond the 220ms Got it fade. No screen-transition motion.
- Module 9 / sync. Reframing of the sync story happens after this module.
- Trade feature. The dupe-trade module concept dissolves with the dupe retirement; replacement scope (if any) is a separate planning session.

## Open questions (decide in plan mode)

**Q1. Welcome screen copy.** Mock placeholder: "980 stickers to find. Let's go through them one by one and mark what you already have." Replace with Daniel-authored copy before slice 1 ships. Acceptable to ship the placeholder if Daniel signs off explicitly.

**Q2. Arrow color.** Lock 14 is "neutral." Pick white (`#F8FAFC`) or muted gray (`#94A3B8`) based on visual hierarchy. Recommend muted gray — arrows are secondary to Need/Have buttons; muted gray demotes them appropriately. Confirm on iPhone smoke.

**Q3. Compact Card path.** Lock 11 leaves (a) extend `Card` vs (b) new `GridCard` as a plan-mode call. Recommend (a) for code-reuse; (b) only if `Card`'s prop surface grows uncomfortable.

**Q4. Picker first-mount dismissability.** First-time entry to Country Browse: should backdrop-tap close the picker (leaving the user on an empty screen), or force a country selection? Recommend: backdrop-tap dismisses; empty state below says "Tap Country Selector to pick a country." Less coercive.

**Q5. Reset reseed behavior.** When Reset wipes the DB, the catalog needs to be reseeded so `firstInventory` has stickers to iterate. Verify the existing seed flow (`src/data/seed.ts`?) is idempotent and can be called after `db.stickers.clear()`. If not, this is a slice-2 dependency to fix.

**Q6. Specials pseudo-country code.** Internal code for routing/filtering — use `'SPE'`? `'SPECIALS'`? A sentinel like `null`? Recommend `'SPE'` for consistency with 3-letter country codes; the data layer never sees it (it's a UI-only construct).

**Q7. Spec 06.** Three deferred items still apply (all-done celebratory, color-collision label, but **NOT** lookup-no-result — that's gone with Lookup). Keep spec 06 as a deferred placeholder; reassess content after Module 7 ships.

## Suggested slices

This spec is too large for one Claude Code plan-mode session. Four slices, ~30 min each. Per the Module 6 precedent (4 slices), budget for one polish slice based on iPhone smoke.

### Slice 1 — View enum + Welcome + routing skeleton
- Update `View` union; add `'welcome'`, `'countryBrowse'`. Keep `'lookup'` temporarily so the build doesn't break.
- Create `<Welcome>` component.
- Implement app-entry routing per §Routing model.
- App routes mid-pass and post-pass exactly as before (still hits Lookup on done — that's intentional for this slice).

Done when: First launch shows Welcome → tap CTA → FirstInventory → make 1 decision → reload → resume on FirstInventory. Reset is not wired yet (slice 2). Tests green.

### Slice 2 — FirstInventory restructure
- Drop the `dupe` branch from `handleAction`. Drop the third button.
- Add `furthestIndex` state alongside `currentIndex`.
- Add arrow-nav row (visibility per lock 6).
- Add Reset link + `<ConfirmDialog>`. Wire to wipe + reseed + setView('welcome').
- Change counter to position semantics.
- Apply link styling per lock 13: Reset link = fifa-red underlined. Apply arrow color decision from Q2.
- Update unit tests on `lookupLogic.ts` if applicable (or leave Lookup tests alone for slice 4 deletion).

Done when: First-pass flow works with 2 buttons. Arrows visible per rules. Reset wipes + reseeds + lands on Welcome. iPhone smoke: tap arrows mid-pass, position updates, reviewed count doesn't double-count. Tests green.

### Slice 3 — Country Browse + GridCard + done-state reroute
- Create `<CountryBrowse>`, `<CountryPicker>`, `<GridCard>` (or extended Card per Q3).
- Wire FirstInventory done → `setView('countryBrowse')`.
- Picker opens auto on Country Browse mount; selection populates grid.
- Got it button writes Have + fades + removes from grid.
- Specials pseudo-country renders with no team stripe.

Done when: Pass complete → Country Browse → picker → Brazil → grid → Got it → fade → DB updated → reload preserves. Specials works the same. Tests green.

### Slice 4 — Delete Lookup + docs + journal
- Delete `src/features/lookup/` (entire folder).
- Remove `'lookup'` from `View` union; remove any lingering imports.
- Update `CLAUDE.md` per the §Modified list.
- Update `src/data/types.ts` comment.
- Append journal session 6 entry capturing the §4.12 reversal.
- Final iPhone smoke: full Welcome → first pass → Country Browse → reset → Welcome.

Done when: `grep -r "features/lookup" src/` returns zero hits. `grep -r "'lookup'" src/` returns zero hits. CLAUDE.md current. Journal written. Build clean. All tests green.

## Constraints (from CLAUDE.md, §5 and §4)
- No new runtime deps.
- Local-first / offline-only holds — all Got it writes go to Dexie synchronously.
- No new state library (Zustand only).
- No new UI framework (Tailwind + hand-rolled).
- Tap targets ≥44×44 on all new affordances (arrows, Got it, Reset link, picker rows).
- iOS-safe-area-inset hygiene preserved on Welcome and Country Browse.
- The 980-sticker Singapore default (or 1,034 with shinies) remains the data source. No schema changes.

## How to use this spec in Claude Code

For each slice, in a fresh Claude Code session at `/Users/danieltartaro/Library/Mobile Documents/com~apple~CloudDocs/AI/public-products/sticker-swap/`:

```
Read @specs/07-killer-feature-reversal.md (specifically slice N),
@CLAUDE.md, @journal/log.md (head only), and the existing files this slice will touch.

Enter plan mode.
Propose a plan for slice N only — do not pre-plan later slices.
Stop after the plan — do not write code yet.
```

Review the plan for:
- **All open questions Q1-Q7 addressed explicitly** in a Decisions section (only the ones relevant to that slice).
- **Concrete file diffs named** — what's new, what's modified, what's deleted.
- **No scope creep across slice boundaries** — slice 1 must not touch FirstInventory's buttons; slice 2 must not touch Country Browse; slice 3 must not delete Lookup (that's slice 4).
- **No new runtime deps**.
- **Acceptance criteria honored** — especially the iPhone smoke at each slice boundary.

Approve → execute → diff-review → manual iPhone smoke. Open queue items get logged in `journal/log.md` after each slice per doctrine §7.

## Decision log
- 2026-05-28 (Cowork) — §4.12 killer feature reversal. Type-a-code Lookup retired; country-browse with tap-to-mark replaces it. CLAUDE.md "What this is" + "Performance contract" rewritten in slice 4.
- 2026-05-28 (Cowork) — Dupe state retired from the UI model. `owned >= 2` is no longer reachable. Trade module concept (was Module 9) dissolves.
- 2026-05-28 (Cowork) — Welcome screen added as a new top-level view. Routes to FirstInventory on CTA; appears at first launch and after Reset.
- 2026-05-28 (Cowork) — FirstInventory restructured: 2 buttons, arrow-rewind, Reset, position counter. Yellow link/arrow color in earlier mocks was Daniel's highlight convention, not a locked color.
- 2026-05-28 (Cowork) — Country Browse uses a bottom-sheet picker. Specials pseudo-country aggregates non-team stickers.
- 2026-05-28 (Cowork) — Link color treatment locked: white underlined for nav, fifa-red underlined for destructive.
- 2026-05-28 (Cowork) — "Lost a sticker" path explicitly deferred. Reset is the only undo in v1.
- 2026-05-28 (Cowork, post-slice-2) — Visual source of truth moved from spec prose to `mocks/` PNGs. Locks 13 and 14 revised per the PNG state. See Amendment block below.
- (add subsequent decisions here as the spec evolves)

---

## Amendment — 2026-05-28 (post-slice-2)

### Visual source of truth
The `mocks/` folder (sticker-swap repo root) contains canonical screenshots of the locked visual state, captured 2026-05-28 after slice 2 shipped. **When the spec text and a mock PNG disagree, the PNG wins.** Slice plans must cite the relevant PNG explicitly and flag any deviation for Daniel approval *before* writing code — never execute silent re-interpretation.

PNG → screen mapping:

| File | Screen / state |
|------|----------------|
| `mocks/07-welcome.png` | Welcome view (first launch / post-reset). HAVE-green CTA "Start first inventory pass", FWC 2026 STICKER SWAP eyebrow, hero mono digit (live count from Dexie), body line, "Takes ~20 minutes for a sealed album" footnote. Matches slice 1 shipped state. |
| `mocks/07-first-inventory-fresh.png` | FirstInventory, position 1 / total, no arrows visible (fresh start). |
| `mocks/07-first-inventory-rewound.png` | FirstInventory mid-pass, user has rewound from leading edge → single left arrow visible at bottom-left. |
| `mocks/07-first-inventory-mid-pass.png` | FirstInventory mid-pass, rewound from `furthestIndex=5` to position 4 → both arrows visible. MEX1 example with green jersey stripe at card top. |
| `mocks/07-country-picker.png` | Country Selector picker bottom sheet open. 8 nations + Specials (off-screen below); jersey swatches at left, missing-count + chevron at right; Germany/Japan dimmed as "complete". |
| `mocks/07-country-browse-grid.png` | Country browse, Brazil selected, "5 / 5 MISSING" header. 2-col grid of compact cards with yellow jersey stripe (Brazil), code + name + type pill + green Got it button. |
| `mocks/07-country-browse-complete.png` | Country-complete empty state. Green check icon + "Brazil complete" + "All 5 stickers in your album. Pick another country." Header link shows country name (Brazil) underlined yellow. |

### Lock 13 amendment — link colors
**Original draft:** Nav links white underlined; destructive links fifa-red underlined.

**Revised per PNG lock:** All in-app text links are **fifa-yellow underlined** (`var(--color-fifa-yellow)`, `#FFD600`). This applies to:
- Reset inventory (destructive) on FirstInventory
- Country Selector (nav) on Country Browse — even when displaying the selected country name (e.g. "Brazil")

The earlier "yellow was just a highlight" reading was wrong. Yellow is the locked color for tap-affordance text links. Body prose and counters stay white / muted gray per existing tokens.

Slice 2 shipped with `fifa-red` for the Reset link per the then-locked spec — that's a deviation from this amendment. Either patch the Reset link color to fifa-yellow now (1-line follow-up), or accept it as a slice-2 carry-forward and patch in slice 4's docs slice.

### Lock 14 amendment — arrow color and style
**Original draft:** Neutral muted-gray, thin chevron outlines.

**Revised per PNG lock:** Arrows are **fifa-yellow chunky filled triangles** (same `#FFD600`). Left arrow edge-positioned on the left of the action area, right arrow mirrored on the right. Both at ~32–40px size with substantial visual weight — the PNG shows a clearly visible filled-triangle shape, not an outline chevron.

Slice 2 shipped with muted-gray thin chevrons per the then-locked spec — this is a real visual delta from the PNG. Patch in a slice-2 follow-up before slice 3 ships, OR slice 3's plan includes both the new screens *and* the arrow restyle (small enough to fold in).

### Process discipline — mocks as authoritative
Earlier slice 2 surfaced a "Claude Code interprets layout" failure mode. Mitigation forward:

1. All new screen designs land first as a static PNG in `mocks/`.
2. Slice prompts cite the PNG path explicitly.
3. Plan-mode reviews must confirm proposed code matches the PNG; any deviation must be flagged for Daniel approval *in the plan*, not executed silently.
4. If the PNG and the spec text disagree, the PNG wins and the spec gets amended (this section is the template).

### Process discipline upgrade (2026-05-28, post-slice-3) — reference .tsx files
Slice 3 shipped and the iPhone smoke surfaced visual drift again, even with PNGs cited in the prompt. Root cause: Claude Code reads a PNG as an image, then has to invent Tailwind classes to recreate it — and the invented classes are "close enough" but not the locked values. PNGs are for *human* eyes; Claude Code needs *code*.

**Upgraded discipline:**
1. For any screen where visual fidelity matters, commit a `mocks/<Component>.reference.tsx` alongside the PNG. The reference is a full JSX tree with every Tailwind class, every inline style, every piece of copy, every SVG path locked.
2. The reference file is NOT imported by production. It exists only as a copy-paste source.
3. Slice prompts say "copy the JSX from `mocks/X.reference.tsx` verbatim into the production component, preserve behavior (state, effects, handlers, db reads), do not change any class or copy."
4. When the production component drifts, run a "visual fidelity patch" slice that re-syncs by copying the reference back. (See slice 3.5 in `specs/07-slice-prompts.md`.)

References live alongside PNGs. Current set:
- `mocks/Welcome.reference.tsx` — Welcome screen, full JSX with locked classes.
- `mocks/FirstInventory.reference.tsx` — FirstInventory active, done, and ConfirmDialog states.

Add `mocks/CountryBrowse.reference.tsx` etc. before any future feature work that touches those screens.
