# Sticker Swap — Journal

> Append-only timeline. Newest entries at top. Each session = one entry. When the journal and the `reference/` / `CLAUDE.md` operating docs disagree, journal wins on facts; the operating docs win on current state. Follows doctrine §7 close protocol.

## 2026-05-26 — Session 4: Module 6 shipped (4 slices) + LICENSE / README / Reddit drafts

### What we did
- **Cowork phase** — closed three items from session 3's open queue without leaving the chat. Wrote `LICENSE` (MIT, 2026 Daniel Tartaro). Rewrote `README.md` for public audience: dual value-prop (1,034-sticker JSON gift + the PWA), prominent laststicker.com attribution, install instructions, "no contributions accepted, fork freely" policy. Drafted three Reddit launch posts (r/PaniniStickers primary, country-sub template, r/webdev secondary) plus comment-reply boilerplate to `scratch/reddit-drafts.md` (gitignored — added `scratch/` to `.gitignore`). Pre-flight README link audit caught one stale path (`src/styles/tokens.css` referenced before slice 1 created it) — dropped from public-audience README.
- **Claude Code phase — Module 6 slice 1 (tokens + primitives)** — Plan-mode surfaced a forking question Cowork hadn't anticipated: spec said `.test.tsx covering render` but `@testing-library/react` isn't installed and the existing test pattern is logic-only Vitest. Decided option 2 (logic-only `.test.ts`) per §4.12 — new toolchain info invalidates the prior call. Pre-execution plan review caught two issues: the operational-surface palette wasn't being exposed in Tailwind config (`text-text-muted` would silently drop), and `ActionButton`'s `<button>` lacked `type="button"` (would trigger form-submit when consumed inside Lookup's search form in slice 2). Both folded in before approval.
- **Slice 2 (layout adaptation)** — Plan-mode flagged two "judgment calls": dropping the standalone state pill from Lookup, and extending `ActionButton` with a `disabled?` prop. Daniel pushed back hard on the state-pill drop — that's a Module 4 re-decision dressed up as a Module 6 simplification (spec 03 explicitly locked "read + context-aware quick toggle" — state pill IS the read half). Action button labels are forward verbs, not state reads. Pill survived; render moved into the `card` slot beneath `<Card>` with FIFA palette mapping (NEED=violet, HAVE=green, DUPE=orange — same colors as the action intents that represent each state-concept). Extracted `deriveLookupState(owned)` helper into `lookupLogic.ts` so the derivation lives in one place. `disabled?` prop accepted as a clean primitive extension based on actual consumer need.
- **Slice 3 (PWA icon)** — Long arc, multiple sub-decisions:
  - Spec mandated "00" as `<path>` (not `<text>`) so the rasterizer doesn't need Archivo Black installed. Cowork extracted real Archivo Black "0" glyph outline from `node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2` via a one-shot `opentype.js` + `wawoff2` script in `/tmp/opentype-shot/` — NOT added to `package.json`. Wrote `public/icon-source.svg` directly from Cowork with precomputed transform values (`translate(53.56, 360.41) scale(0.30351)`), sized to 74% canvas width × 42% height to fit inside the maskable 80% safe zone.
  - Plan-mode surfaced two more questions: (1) Update PWA manifest `theme_color`/`background_color` to fifa-red? (Yes — two-surface framing supports it; the splash transition fires brand→operational at app-shell mount, not at icon-tap. Less jarring.) (2) Glyph path source? (Claude Code's plan went with "Daniel pastes externally" instead of opentype.js extraction; Cowork's pre-written SVG made this moot.)
  - First on-device render: chrome line at `stroke-width=2` was sub-pixel at iOS home-screen scale (60→180px physical = 0.25 physical pixels). Bumped to 8. Multi-scale identity atom learning revised to "same gradient identity at every scale, scale-appropriate weight."
  - Second on-device render via `@vite-pwa/assets-generator`: chrome line still invisible. Pixel sample showed it only rendered at the canvas edges (x=0-12, x=501-511), not in the middle. Diagnosed: `<line stroke="url(#gradient)">` with default `gradientUnits="objectBoundingBox"` is undefined behavior — the line has a degenerate (zero-height) bounding box — and `librsvg` (sharp's backend) renders it inconsistently. ImageMagick handles it gracefully; librsvg doesn't.
  - Fix: switched to `<rect x="0" y="252" width="512" height="8" fill="url(#chrome)">` + `gradientUnits="userSpaceOnUse"` with explicit canvas coords. Verified via sharp directly (the actual asset-generator backend) — chrome line now renders continuously edge-to-edge at all sizes (64 / 180 / 512). Re-ran asset generator, all 6 PNGs regenerated cleanly. Manifest colors flipped to `#D7232A` in `vite.config.ts`.
- **iPhone smoke surfaced 3 polish items** — Cards from FirstInventory (POR17, NED5) read ~50% canvas width while Lookup card (ARG8) reads ~90%, even though both consume the same `<Card>` via the same `<ScreenLayout>`. Some teams have stripes (POR/NED/ARG — in the starter 8) but most don't (CZE/BIH/MEX/JPN — not in starter set). And the "All done" state has no action affordance — PWA standalone has no refresh button, users get stuck.
- **Slice 4 — Module 6 polish (unplanned but well-scoped)** — Three discrete fixes in one plan-mode session. (1) Diagnosed Card sizing root cause: Lookup wraps in `<div className="w-full max-w-sm flex flex-col gap-3">` while FirstInventory passes `<Card>` bare. Fixed at the primitive — added `<div className="w-full max-w-sm">` slot wrapper *outside* `<ChromeFrame>` so both shiny and non-shiny states inherit, plus `min-h-[280px]` on the card body with `flex-1 ... justify-center` content centering. Both consumers now get matching slot dimensions. (2) Expanded `jerseyColors.ts` from 8 → 48 nations using canonical home-kit primaries (Wikipedia federation pages + adidas/Nike/Puma official 2026 imagery, citation block at top of file). 7 nations inherit the Q2a watch (white-on-slate-900): ENG + GHA/IRN/JOR/NZL/SEN/USA. Added 2 assertions to `jerseyColors.test.ts` (48-entry count, hex-format sweep). Swapped MEX5 → XYZ5 in the unknown-prefix test since MEX is now a known prefix. (3) Refactored FirstInventory done branch onto `<ScreenLayout>` with counter = "All done" + "980 / 980 reviewed", card = null (reserved for spec 06 celebratory state), actions = `<ActionButton intent="have" label="Start swapping" onClick={() => setView('lookup')}>`. Same atoms, semantic re-stacking.
- Verified after slice 4: tests 53/53, build clean (306 KB JS bundle), PWA precache regenerated, all four file changes structurally correct on Cowork-side spot-check.

### Decisions locked
- **Module 6 ships in 4 slices, not 3.** Smoke-driven slice 4 is part of Module 6's scope, not the start of spec 06. Adopt this pattern: any multi-slice module budgets for an unplanned polish slice after on-device smoke.
- **Logic-only `.test.ts` pattern across all primitives.** Spec wording `.test.tsx covering render` was aspirational toolchain — `@testing-library/react` isn't installed; existing pattern is pure-logic Vitest. Per §4.12, the testing convention is now: lookup maps + pure helpers get `.test.ts`; render assertions are deferred to on-device smoke.
- **State pill stays as the read-half of "read + context-aware quick toggle."** Spec 03 lock reaffirmed via §4.12 pushback. Lives inside the `card` slot beneath `<Card>`, FIFA palette per state-concept mapping (NEED=violet / HAVE=green / DUPE=orange).
- **Chrome line implementation: `<rect fill="url(#gradient)">` + `gradientUnits="userSpaceOnUse"`.** Not `<line stroke=...>`. Portable across rasterizers. Stroked gradients on lines hit a librsvg edge case that left the line invisible mid-canvas in `@vite-pwa/assets-generator`'s sharp pipeline.
- **Chrome line weight: 8px at icon scale, 2px in-app.** The session-3 multi-scale atom learning ("same 2px line at every scale") was empirically wrong — 2px is sub-pixel at iOS home-screen render. Revised: same gradient *identity* at every scale, scale-appropriate weight. In-app `<ChromeDivider>` stays at 2px (operational surface, slate-800 background, no rasterization gauntlet).
- **PWA manifest colors = fifa-red.** `theme_color` and `background_color` both `#D7232A`. Two-surface framing argues for it: brand surface extends through the icon-tap → splash transition; operational surface starts at app-shell mount.
- **Slot dimensions live on the Card primitive, not the consumers.** `w-full max-w-sm` + `min-h-[280px]` baked in. Both consumers get matching slots for free. Lookup's existing wrapper still controls the StatePill width below the card but no longer determines Card size.
- **Jersey table is the canonical home-kit primary**, sourced from Wikipedia federation/kit pages + 2026 official kit imagery. 48 entries cover all unique prefixes in the catalog. Q2a inheritance (7 white-home nations) carries as a single watch item — one batched dim-to-`#D4D4D8` patch if on-device daylight test fails.
- **"All done" is a third `<ScreenLayout>` view.** Same primitives, semantic re-stacking — large "All done" on top of muted count below (inverts the active counter). Card slot left null for spec 06 to fill with celebratory empty state.

### Findings (promoted to learnings.md)
- **Rasterizer matters for icon verification.** Slice 3 burned cycles because ImageMagick rendered the chrome line correctly while sharp/librsvg (the asset-generator backend) didn't. Same SVG, two outputs. Lesson: when verifying SVG-to-PNG, render through the same pipeline that ships — not whatever rasterizer is convenient.
- **One-shot tools via /tmp scratch directories.** The `opentype.js` + `wawoff2` extraction ran in `/tmp/opentype-shot/` (isolated `npm install`), produced inline SVG path data, then the script was discarded. `package.json` stayed clean. Reusable pattern for any "use a dep once, commit the output" workflow.
- **Smoke-driven slice expansion is the norm, not the exception.** Module 6 was planned as 3 slices. Slice 4 absorbed three on-device findings in one ~30 min plan-mode session. Lesson: budget for an extra slice in any multi-slice module — smoke reliably surfaces 1-3 items the spec didn't anticipate.
- **Push back when a plan "simplifies" by dropping existing UI.** Claude Code's slice 2 plan proposed removing the state pill because action-button labels carry state info. That was a Module 4 re-decision (spec 03's "read + context-aware quick toggle" lock) disguised as a Module 6 simplification. Catching it required tracing the existing `ResultCard` back to its spec. Pattern: when a plan removes existing UI, ALWAYS trace what spec/lock created it before approving.
- **Pre-flight Tailwind utility resolution.** Slice 1 review caught that `text-text-muted` would silently drop because only `fifa-*` was being extended in tailwind.config.js. Tailwind v3 drops unknown classes without warning → no build error, just unstyled text. Pattern: when extending `theme.extend.colors`, audit ALL utility classes consumers will use against the extended config.

### Findings (carry-forward only — not promoted)
- **Color-collision team-identity gap.** 48-nation jersey expansion necessarily creates same-color stripes across multiple nations: 13 reds (AUT/BEL/CAN/CRO/CZE/EGY/KOR/MAR/NOR/PAN/PAR/SUI/TUN/TUR), 7 whites (ENG/GHA/IRN/JOR/NZL/SEN/USA), 3 greens (ALG/IRQ/KSA/MEX). Stripe color alone doesn't disambiguate at swap-table use. Likely spec 06 fix: small team-text label below the sticker code on the Card. Watch item, not a blocker — slice 4 closed the "missing stripe" problem; collision is the next layer.
- **librsvg / sharp can render `<line stroke="url(#bbox-gradient)">` inconsistently.** Specific technical fact captured in the icon-source.svg comments. Probably general enough to matter for any future SVG asset work in this stack — `<rect fill="url(#gradient)">` is the portable form.

### Files touched
- **New (Cowork phase):** `LICENSE`, `scratch/reddit-drafts.md`
- **New (Module 6 — Claude Code):** `src/styles/tokens.css`, `src/components/Card.tsx`, `src/components/TypePill.tsx` + `.test.ts`, `src/components/TeamStripe.tsx`, `src/components/ChromeDivider.tsx`, `src/components/StickerCode.tsx` + `.test.ts`, `src/components/ActionButton.tsx` + `.test.ts`, `src/components/ScreenLayout.tsx`, `src/data/jerseyColors.ts` + `.test.ts`
- **Modified (Cowork phase):** `README.md`, `.gitignore` (added `scratch/`)
- **Modified (Module 6):** `src/index.css` (tokens import), `tailwind.config.js` (FIFA + operational palette + font-family extensions), `src/main.tsx` (Fontsource import), `package.json` (+ `@fontsource/archivo-black`), `src/features/inventory/FirstInventory.tsx` (refactored onto ScreenLayout + slice-4 done-branch refactor), `src/features/lookup/LookupScreen.tsx` (refactored onto ScreenLayout + StatePill + deriveLookupState), `src/features/lookup/lookupLogic.ts` (+ `deriveLookupState`), `src/features/lookup/lookupLogic.test.ts` (+ 3 cases), `vite.config.ts` (manifest colors flipped to fifa-red), `public/icon-source.svg` (full rewrite via Cowork — real Archivo Black "00" path data, chrome rect, userSpaceOnUse gradient), all 6 PWA PNG assets in `public/` (regenerated twice — once for stroke=8, once for the rect+userSpaceOnUse fix)

### Open queue going into session 5
1. **iPhone PWA reinstall + on-device acceptance for slice 3 icon.** Delete old PWA from home screen, re-add from `192.168.1.21:4173` (or wherever the production preview is serving). Confirm fifa-red icon with visible white "00" and chrome midline renders (not the old slate-900 placeholder). Spec §332-334 done criterion.
2. **iPhone smoke for slice 4.** Card dimensions match across FirstInventory and Lookup (side-by-side check on the same player, e.g., POR17). Newly-added nations show stripes (MEX, JPN, KSA, BEL, CRO at minimum). All-done CTA transitions cleanly via `await db.stickers.toCollection().modify({reviewed: true})` + refresh in DevTools.
3. **Daylight Q1 check on fifa-orange Dupe button.** Still un-tested in real daylight — only verified at 15:23 indoor. Carry-forward from slice 2 smoke.
4. **GitHub push.** `github.com/danieltartaro/sticker-swap` likely. Needs Daniel's keyboard for auth. After push, fill in `<REPO_URL>` and `<JSON_URL>` placeholders in `scratch/reddit-drafts.md` before posting anywhere.
5. **Reddit posts.** r/PaniniStickers primary + 1-2 country subs. Lead with the JSON, app as bonus. Drafts in `scratch/reddit-drafts.md`.
6. **Spec 06 — empty states + concentric "26" wallpaper.** Now has expanded scope: also includes (a) inventory-complete celebratory empty state (fills the `card` slot in the new All-done view) AND (b) the color-collision team-identity gap (likely team-text label below the sticker code). Lookup-no-result placeholder stays in scope per the original spec 06 framing.
7. **Possible spec 05 slice 5 — if Q2a or Q1 smoke fails.** Batched dim of 7 white-home nations to `#D4D4D8` and/or fifa-orange darkening to `#C8431F`. Both are well-defined small patches; not a blocker, only if on-device daylight test demands.

### Deviations from planned scope
- Module 6 was planned as 3 slices in session 3's open queue. Actual execution was 4 slices — slice 4 absorbed three smoke-driven polish items. Honest deviation captured per §4.5; promoted as the "smoke-driven slice expansion is the norm" learning above.
- Slice 1 spec wording `.test.tsx covering render` was implemented as `.test.ts` logic-only. §4.12-compliant — RTL not installed; existing pattern is logic-only. Spec 05 §239 done-criteria line not edited; this journal entry is the decision-log update.
- Slice 3 chrome line: spec said 2px stroke. Landed as 8px rect fill. §4.2 + §4.12 — 2px was sub-pixel at icon scale; `<line stroke=...>` was rendering inconsistently across rasterizers. Both decisions documented inline in the SVG comments.
- Spec 06 scope expanded mid-session 4 to absorb the team-identity-gap fix (in addition to the original empty-state scope). Honest expansion — both surfaces deal with "what the card looks like under varying conditions."

## 2026-05-26 — Session 3: design system v1 — 8 decisions locked, spec 05 written, iPhone scroll bug closed

### What we did
- Opened with the three-part snapshot. Daniel reported the iPhone scroll bug on FirstInventory (card position clips the action buttons at the viewport bottom) and asked to use this session to build a "mini design system."
- Pulled five FIFA WC 2026 references (the emblem mark, the Toronto host poster, the tri-host poster, the Panini sticker pack wrapper, and the definitive emblem image with the concentric "26" wallpaper + chrome mirror line). Extracted the FIFA palette (~8 saturated brand colors), the chunky rounded-terminal display numeral aesthetic, the chrome mirror motif, and the holographic-strip identity cue.
- Reframed the design conversation around **two surfaces**: operational (slate-900, utilitarian, fast — FirstInventory, Lookup, future Inventory browser) and brand (FIFA palette, chunky display, chrome detail — icon, splash, empty states, celebratory moments). This unlock dissolved the "utilitarian vs nostalgic" false choice.
- Ran seven 4-option mockup exercises in Cowork, locking one decision each (typography stack, PWA icon brand commitment, action button color mapping, card layout / chrome divider position, type pill treatment, team affiliation treatment, shiny indicator treatment). Each exercise rendered as an inline widget mockup; Daniel reacted to visuals rather than concepts.
- Wrote `specs/05-design-system.md` (Module 6) — three-slice spec consolidating all 8 locks with concrete CSS variable definitions, component primitive specs (`<Card>`, `<TypePill>`, `<TeamStripe>`, `<ChromeDivider>`, `<StickerCode>`, `<ActionButton>`, `<ScreenLayout>`), open questions for plan-mode, and an 8-team jersey-primary starter table.
- Created `learnings.md` with five session-level takeaways (references-first, two-surface framing, multi-scale identity atoms, 4-option-exercises-as-decision-engine, session-tasklist-as-design-tracker, watch-items-over-re-decisions).
- Updated `CLAUDE.md` Stack section to reflect the new design system + Archivo Black runtime dep.

### Decisions locked (eight)
1. **Two-surface framing.** Operational + brand surfaces, bridged by the chrome line atom.
2. **Typography stack.** Display = Archivo Black (Fontsource, self-hosted). Mono = SF Mono / `ui-monospace`. Sans = SF Pro / `-apple-system`. Three faces, three jobs (identity / data / body).
3. **PWA icon.** `fifa-red #D7232A` background, white Archivo Black "00", 2px chrome gradient line bisecting at midpoint. Channels the FIFA brand mirror motif.
4. **Action button colors.** Need = `fifa-violet #9B5BD2`, Have = `fifa-green #2BAA4F`, Dupe = `fifa-orange #E55B2A`. Lookup 4th state (gave-one-away) = `fifa-red #D7232A`.
5. **Card layout.** 3-zone viewport-fit (counter top with `safe-area-inset-top`, card flex-1 middle, full-width chrome divider, action bar bottom with `safe-area-inset-bottom`). Uses `100dvh`. Closes the iPhone scroll bug.
6. **Type pill treatment.** Outlined per-type. 1px border + matching text in the FIFA token, transparent background. PLAYER = fifa-blue, BADGE = fifa-yellow, LEGEND = fifa-violet, SPECIAL = fifa-teal, GROUP = fifa-red.
7. **Team affiliation.** 5px horizontal stripe at card top edge, jersey-primary per nation. Only on player/badge types. Starter table: BRA/ARG/GER/FRA/ENG/ESP/NED/POR; remaining ~40 nations default to neutral until added incrementally.
8. **Shiny indicator.** 1.5px chrome gradient frame around the entire card (wrapper-frame technique). Binary signal, orthogonal to type. Reuses the chrome metallic language.

### Findings
- **References-first beats vibe-first.** Daniel's redirect from abstract north-star questioning to "discuss references first" was the right designer instinct. Five refs gave us 8 extractable tokens we'd never have surfaced from vocabulary alone. Promoted to `learnings.md`.
- **Two-surface framing is the unlock that dissolves "utilitarian vs branded."** Promoted to `learnings.md`.
- **The chrome line is a multi-scale identity atom.** Same gradient token at 2px on the 60×60 icon, 2px on the 175×340 viewport, 1.5px around shiny cards. One primitive does brand work at every scale. Cheapest possible identity multiplier. Promoted to `learnings.md`.
- **4-option mockup exercises drive faster, more durable decisions than open discussion.** Daniel made each call in <30 seconds of looking at the rendered widget. The structure forces specificity and kills the "what about…" tail. Promoted to `learnings.md`.
- **Watch items > re-decisions.** Two known risks captured at lock-time (`fifa-orange` 3.2:1 contrast on white button text; `fifa-violet` shared between LEGEND type pill and Need action button) flagged in the spec's decision log as on-device-test items, not as blockers and not as re-decisions. Aligns with doctrine §4.2 (probe runtime) without violating §4.12 (prior calls stand). Promoted to `learnings.md`.

### Files touched
- New: `specs/05-design-system.md`, `learnings.md`
- Modified: `CLAUDE.md` (Stack section — Tailwind line + Archivo Black added, design system pointer), `journal/log.md` (this entry)
- No source files touched — design phase only. Module 6 implementation lands in session 4 via Claude Code.

### Watch items (carry forward)
- **fifa-orange button contrast (3.2:1 white text).** Test on iPhone in daylight at slice 2 done-criteria check. If unreadable, darken to `#C8431F` (still in family, ~4.7:1).
- **fifa-violet doing double duty** as LEGEND type-pill color AND Need action-button color. Could read as "these are related" when they're not. Watch at swap-table use.

### Open queue going into session 4
1. **Module 6 slice 1 (Claude Code):** execute `specs/05-design-system.md` slice 1 — tokens + 6 component primitives + Fontsource install. ~30 min. No screen wiring yet.
2. **Module 6 slice 2 (Claude Code):** execute slice 2 — `<ScreenLayout>`, FirstInventory + Lookup refactor onto primitives, 8-team jersey lookup. ~30 min. Done criteria includes iPhone smoke test of the scroll-bug fix.
3. **Module 6 slice 3 (Claude Code):** execute slice 3 — PWA icon redesign, asset regeneration, iPhone home-screen reinstall. ~15 min.
4. **LICENSE (MIT).** Top-level file. Standard MIT template.
5. **Public-audience README rewrite.** Hero copy, dual value-prop (1,034-sticker JSON + the app), credit `laststicker.com` per `sources.md`, install instructions, "no contributions accepted, fork freely" policy.
6. **GitHub push.** `github.com/danieltartaro/sticker-swap` likely.
7. **Reddit posts.** r/PaniniStickers + country subs. Lead with the JSON gift, app as bonus.
8. **Spec 06 (Cowork, later):** empty states + the concentric "26" wallpaper. Inventory-complete celebration is the highest-value empty state.

### Deviations from planned scope
- Session 2's open queue item #1 was "Design refinement (Cowork-led — new session)" with output described as "one batched Claude Code handoff to apply final class changes." Executed substantially larger than that — produced a full Module 6 spec, not just class changes. Reason: the design conversation surfaced a coherent system rather than ad-hoc adjustments, and a system needs a spec, not a class patch. Honest deviation, captured here per §4.5.

## 2026-05-26 — Session 2: Modules 4 + 5 shipped — functional core complete, app installable on iPhone

### What we did
- Verified Module 3 in hand on iPhone: counter shows `0 / 980`, first card `00 — Panini Logo`, no `s`-suffix codes appear during inventory pass. Real player names render correctly (Maignan, Saliba, Mbappe, Messi).
- Wrote `specs/03-lookup-screen.md` with three forking decisions surfaced via AskUserQuestion — Daniel took all three recommendations: native mobile keyboard with autofocus / real-time exact match / read + context-aware quick toggle.
- Shipped Module 4 (lookup screen) via Claude Code in one plan-mode session. New: `src/store/view.ts` (Zustand), `src/features/lookup/{LookupScreen.tsx, lookupLogic.ts + test, inventoryDone.ts + test}`. Modified `App.tsx` for smart routing (Zustand atom with `null` loading sentinel; mount-time completion check decides view).
- Wrote `specs/04-pwa-shell.md` for installable PWA + offline service worker.
- Shipped Module 5 via Claude Code: `@vite-pwa/assets-generator` (devDep, one-time CLI run), generated 6 icon assets in `public/`, populated `manifest.icons` in `vite.config.ts`, added proper `<link rel="apple-touch-icon">` in `index.html` (Safari prefers this over manifest icons for home-screen install — Claude caught this beyond what the spec required).
- Verified PWA install on iPhone: full-screen launch from home-screen icon, correct "00" icon renders, works offline.
- Doctrine cleanup pass from session 1b's open queue skipped — Daniel explicitly overrode §4.10 emoji rule for this project. CLAUDE.md updated with the override note so future sessions don't re-flag.

### Decisions locked
- **Lookup entry method:** native mobile keyboard with autofocus. Rejected custom button-pad, rejected voice.
- **Lookup match strategy:** real-time exact match only. Rejected prefix autocomplete (UI complexity), rejected fuzzy (false-match risk at swap table).
- **Lookup result actions:** read + context-aware quick toggle. Buttons appear based on current `owned` value (NEED → "Now I have it"; HAVE → "Got a dupe"; DUPE → "Got another" + "Gave one away"). Inventory updates happen from the lookup screen — no bouncing back to inventory mode at swap table.
- **View routing:** Zustand atom with smart default (inventory until done → lookup after). No manual switch UI in v1. No auto-transition mid-session — mount-time check only.
- **Spec 03 Q2 deviation: `db.stickers.filter(s => !s.reviewed).count()`** instead of the spec's `where('reviewed').equals(0).count()`. IndexedDB doesn't allow boolean keys; Dexie silently fails the index. Filter-based scan is cheap at 980 rows. Schema v4 could migrate `reviewed` to `0 | 1` numeric to restore the indexed query — deferred.
- **PWA icon source:** `public/icon-source.svg` — slate-900 background, "00" monospace in slate-50, centered, glyph confined to ~80% safe zone (maskable variant).
- **PWA asset generation:** `npx @vite-pwa/assets-generator --preset minimal-2023 public/icon-source.svg`, commit resulting PNGs. No prebuild hook — icons rarely change.
- **PWA precache:** default Workbox `globPatterns`. Catalog is bundle-embedded via `import` in `src/data/catalog.ts`; verified empirically by grepping "MEX5" and "FRA1" strings in `dist/assets/index-*.js`. No runtime catalog fetch.
- **Doctrine §4.10 emoji rule: explicitly overridden** for this project (Daniel call, 2026-05-26). Decorative emojis allowed in docs (MASTERCLASS.md, specs/*.md). No-secrets, prose-where-prose-fits, Brasil-with-S still apply.

### Findings
- **IndexedDB doesn't allow boolean keys.** Dexie silently fails the secondary index on `reviewed: boolean`. Table data is fine (rows are stored), but `.where('reviewed').equals(0 | 1).count()` always returns 0. Catastrophic bug class because tests can pass on the function while the runtime query is broken. Detected during Module 4 plan mode by Claude empirically reasoning about IndexedDB constraints. Filed under §4.12 (prior call invalidated — spec 03 Q2 corrected via journal note rather than spec edit).
- **Empirical artifact verification beats trusting build output.** Module 5's Q3 wasn't satisfied by "build was clean"; Claude opened `dist/sw.js`, found the catalog-carrying JS chunk, grepped it for known player names. That's the §4.2 pattern at full strength — verify the artifact contains what you think it should, don't just trust the pipeline.
- **iOS Safari prefers HTML `<link rel="apple-touch-icon">` over manifest icons for home-screen install.** Some PWA tutorials miss this and end up with generic ghost-icons. Adding the explicit HTML link in `index.html` is load-bearing for the iOS install experience. Claude caught it beyond spec.
- **Zustand `view: View | null` loading sentinel.** Prevents flash-of-wrong-view during the async completion-check round-trip. Small UX detail, big polish payoff. Worth using in any view-state Zustand store that resolves async.
- **Plan-mode "recommended" agreement is a positive signal too**, not just dissent. Three rounds in Module 4 / Module 5 plans had me agreeing with Claude's recommended — and twice flagging Claude's empirical work (Q3 grep, Q2 IndexedDB deviation) as gold-standard behavior. Reinforcing good plan-mode behavior shapes future sessions; the rating prompt and "nice catch" notes in chat are the channel.

### Files touched
- New (Module 4): `src/store/view.ts`, `src/features/lookup/LookupScreen.tsx`, `src/features/lookup/lookupLogic.ts`, `src/features/lookup/lookupLogic.test.ts`, `src/features/lookup/inventoryDone.ts`, `src/features/lookup/inventoryDone.test.ts`
- New (Module 5): `public/icon-source.svg`, `public/pwa-64x64.png`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`, `public/favicon.ico`
- New (specs): `specs/03-lookup-screen.md`, `specs/04-pwa-shell.md`
- Modified: `src/App.tsx` (view routing), `index.html` (icon links), `vite.config.ts` (PWA icons), `package.json` (+ `@vite-pwa/assets-generator` devDep), `README.md` (PWA install path), `CLAUDE.md` (emoji override note + folder map for `public/`)

### Open queue going into session 3
1. **Design refinement (Cowork-led — new session).** Daniel opens a fresh Cowork session, shares a screenshot of FirstInventory + the vibe he wants, iterates on Tailwind classes interactively. Output: one batched Claude Code handoff to apply final class changes. Lookup screen styling derives from the agreed vocabulary; no separate iteration needed.
2. **LICENSE (MIT)** — top-level `LICENSE` file. Standard MIT template.
3. **Public-audience README rewrite.** Current `README.md` is project-internal. Needs hero copy, the dual value-prop (clean 1,034-sticker JSON for Reddit collectors + the app for personal use), credit to laststicker.com per `sources.md`, install instructions, "no contributions accepted, fork freely" policy.
4. **GitHub push.** Create repo (likely `github.com/danieltartaro/sticker-swap`), push, verify no CI is needed for a personal/learning project at this scale.
5. **Reddit posts.** Drafts for r/PaniniStickers and country-specific subs. Lead with the JSON artifact (high-value gift for collectors who don't care about the app); mention the app as a bonus.

### Deviations from planned scope
- **Doctrine cleanup (open queue item 5 from session 1b) skipped.** Daniel explicitly overrode §4.10 emoji rule. Not a doctrine violation — the doctrine §4.5 inverse rule applies ("when Daniel explicitly delegates a decision, execute — don't re-ask"), and the override is now persisted in CLAUDE.md.
- **Module 5 executed today** rather than being optional for shipping. Original session 1b open queue treated Module 5 as part of "Spec 04 (Cowork) + Module 5 (Claude Code)" but the timeline was loose. Path C was chosen mid-session (push through everything today); Module 5 became required, not deferred.

## 2026-05-26 — Session 1b: regional-variant correction (Singapore default, European opt-in)

### What we did
- Verified the Panini WC 2026 album in hand (Singapore edition): `FRA2` prints directly below Mike Maignan; no `FRA2s` slot exists. Concluded the 54 `s`-suffix codes in the bundled catalog are European-edition-only (Germany / Belgium / France bonus shinies).
- Patched `transformCatalog` to take `{ includeShinies?: boolean } = {}`, defaulting `false`. Default path filters s-codes before mapping, yielding 980 contiguous `sortIndex` rows; flag-on path keeps the full 1,034.
- Bumped Dexie schema to v3 with a wipe-and-reseed upgrade hook so existing v2 browsers re-key onto the 980-row Singapore catalog.
- Updated `transformCatalog.test.ts` to cover both editions (980 default / 1,034 with flag; 48 shinies default / 102 with flag) plus a new "no s-suffix in default" assertion.
- Updated `CLAUDE.md` `isShiny` narrative to reflect the new default rule and the `includeShinies` opt-in.

### Decisions locked
- **App default = Singapore edition.** 980 stickers, 48 shinies (badges only).
- **European edition gated** behind `transformCatalog(rawCatalog, { includeShinies: true })`. No runtime UI toggle yet — flag is code-level only.
- **Raw JSON stays at 1,034**, unchanged. The catalog file is the public artifact; the app filters at the consumer boundary.
- **Dexie v3 upgrade wipes and reseeds.** Any in-progress v2 review state is discarded — acceptable because existing v2 data was throwaway test taps. If real review state had landed in v2, we would have switched to a key-preserving upgrade instead.

### Findings
- Physical-album diagnostic is faster than scraper cross-checking for regional questions. General data-engineering principle (uncited-but-conventional): preserve upstream artifacts intact, filter at the consumer boundary.
- `inferType` is pure on `(name, team)` and ignores `code` — filtering s-suffix codes doesn't perturb its output, so the existing inferType tests remain valid without edits.
- Spec 02's `canonicalCount: 1034` was always the catalog's count, not the app's published count — per CLAUDE.md §4.12 this correction doesn't revisit the spec, it lives in the journal.

### Files touched
- Modified: `src/data/transformCatalog.ts`, `src/data/transformCatalog.test.ts`, `src/data/db.ts`, `CLAUDE.md`, `journal/log.md`

### Open queue going into session 2
1. **Module 3 verification (Daniel):** open the app on iPhone; v3 upgrade fires; counter shows `0 / 980`; first sticker `00 — Panini Logo`; `FRA2s` does not appear during the inventory pass.
2. **Spec 03 (Cowork):** write `specs/03-lookup-screen.md` — the killer feature. Decisions: full-screen vs subview, keyboard-first vs button-first, partial-match vs exact-match.
3. **Module 4 (Claude Code):** execute lookup screen.
4. **Spec 04 (Cowork) + Module 5 (Claude Code):** PWA shell — manifest, icons, install prompt, validate build-time service worker.
5. **Doctrine cleanup pass:** strip decorative emojis from MASTERCLASS.md + spec 01.
6. **Open-source rollout:** LICENSE (MIT), public-audience README, credit laststicker.com per `sources.md`, push to GitHub, draft Reddit posts.

### Deviations from planned scope
None. Session was a targeted regional-variant correction on top of session 1's catalog ingest, executed via plan-mode-then-execute.

## 2026-05-25/26 — Session 1: scaffold → slice 1 shipped → catalog acquired → specs 01 + 02 written

### What we did
- Set up project at `/AI/sticker-swap/` with Vite + React 18 + TS + Tailwind + Dexie + Zustand + vite-plugin-pwa.
- Wrote `CLAUDE.md` as project memory (target <200 lines, opinionated, with canonical `Sticker` data model).
- Wrote `MASTERCLASS.md` as living tutorial — the project doubles as a hands-on Claude Code masterclass.
- Wrote `specs/01-first-inventory.md` and shipped slice 1 via one Claude Code plan-mode session, manual approve:
  - `src/data/{types.ts, db.ts, seed.ts}` — Dexie schema v1, synthetic 670-sticker seed
  - `src/features/inventory/FirstInventory.tsx` — counter + card + 3 buttons (Need / Have / Dupe), `await db.put → then advance`, resume on mount, minimal done state
  - `src/data/seed.test.ts` — 5 pure-function tests; React-component tests deferred to slice 2 (would need 3 new devDeps beyond what plan authorized)
- Verified on Daniel's iPhone via `npm run dev -- --host` over LAN. Tap cadence felt instant.
- Scraped real Panini catalog from laststicker.com via Cowork Chrome MCP (site is Cloudflare-gated; raw HTTP can't reach it). Extracted 1,034 canonical stickers (code/name/team). Triggered browser download; Daniel to move file into `data/raw/`.
- Wrote `specs/02-catalog-ingestion.md` for Module 3 — parse JSON, infer types, transform to `Sticker[]`, bump Dexie schema to v2, introduce `sortIndex` to preserve album order.
- Read DOCTRINE.md v1.4. Mapped applicability to this folder (see Doctrine notes in `CLAUDE.md`). Set up session ritual triggers + this journal.

### Decisions locked
- **Stack:** Vite + React 18 + TS + Tailwind + Dexie + Zustand + vite-plugin-pwa. No additional UI framework. No router (state-driven view switching when needed).
- **Performance contract:** <50ms keypress-to-result, fully offline. Drives every architecture choice.
- **`reviewed: boolean` on Sticker** to distinguish "unseen" from "decided need" (spec 01 Q1). Rejected `owned: -1` sentinel because it pollutes every downstream consumer.
- **Catalog size: 1,034** (full canonical), not 980. Includes Germany/Belgium/France +18 bonus subsets. Reason: simplicity — any printed code should be one-tap lookup-able at a swap event.
- **Catalog source: laststicker.com checklist** (recorded in `sources.md`). Cutoff at `FWC19`; anything after is regional promo and excluded.
- **Open-source today under MIT license.** Highest-value public artifact is the 1,034-sticker JSON for Reddit Panini communities. The app is the bonus.

### Findings
- **Cowork ↔ Claude Code division of labor.** Cowork has the browser, Claude Code has the codebase. When a task needs both, scrape in Cowork → save to disk → hand the file to Claude Code for transformation. Don't try to scrape from Claude Code's terminal — Cloudflare et al. block headless HTTP.
- **Cowork tool outputs cap around ~3KB**, not the 50KB stated for `get_page_text`. Chunked extraction + browser-download is the workaround for large payloads.
- **Code-order ≠ album-order** (lexicographic ASCII: `-` < `0`, so `ARG-BADGE` sorts before `ARG01`). Real album order needs `sortIndex: number`. Lands with Module 3.
- **Plan mode's "recommended" option is a signal, not gospel.** Twice this session I evaluated Claude's recommended: once agreed (no router, Zustand seam), once overrode (synthetic seed size — picked Option 3 for realistic perf, not Claude's Option 1). Develop the habit of independent evaluation.
- **Honest deviations beat silent compromises.** Slice 1 execution flagged the React-test devDep escalation transparently in its summary. Reinforce this behavior in feedback to Claude.

### Files touched
- New (scaffold): `CLAUDE.md`, `MASTERCLASS.md`, `README.md`, `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`
- New (slice 1, via Claude Code): `src/data/{types.ts, db.ts, seed.ts, seed.test.ts}`, `src/features/inventory/FirstInventory.tsx`
- New (specs): `specs/01-first-inventory.md`, `specs/02-catalog-ingestion.md`
- New (this session): `journal/log.md`, `sources.md`
- Modified (slice 1): `src/App.tsx` (`return <FirstInventory />`), `CLAUDE.md` (data model gained `reviewed: boolean`)
- Modified (this turn): `CLAUDE.md` (doctrine pointer + session ritual + doctrine notes)
- Pending (Daniel-side): move `~/Downloads/panini-wc-2026-catalog.json` → `data/raw/panini-wc-2026-catalog.json`

### Doctrine compliance flags (clean up before open-source push)
- **§4.10 emoji rule** — `MASTERCLASS.md` and `specs/01-first-inventory.md` contain decorative emojis (✅ ❌ 🔄 ⚠️ ✦) that should be stripped to plain text. Functional in-app glyphs (the shiny indicator on the BADGE pill on screen) are exempt — those are UX, not doc decoration.
- **§4.3 no assumed state** — I assumed 670 stickers (pre-2026 math). Daniel corrected to 980. Reality is 1,034. The synthetic generator hardcoded the wrong number; correction lands when Module 3 deletes the synthetic seed entirely. No doc to retract because CLAUDE.md never asserted a count.

### Open queue going into session 2
1. **Daniel:** run the `mv` command to land `data/raw/panini-wc-2026-catalog.json` (Module 3 blocker).
2. **Module 3 (Claude Code):** execute `specs/02-catalog-ingestion.md` — JSON parse, type inference, transform, schema v2, delete synthetic seed.
3. **Spec 03 (Cowork):** write `specs/03-lookup-screen.md` — the killer feature. Decisions to make: full-screen vs subview, keyboard-first vs button-first, partial-match vs exact-match.
4. **Module 4 (Claude Code):** execute lookup screen.
5. **Spec 04 (Cowork) + Module 5 (Claude Code):** PWA shell — manifest, icons, install prompt, validate build-time service worker. Required for "install on phone."
6. **Doctrine cleanup pass:** strip decorative emojis from MASTERCLASS.md + spec 01.
7. **Open-source rollout:** LICENSE (MIT), rewrite README for public audience with prominent catalog section, credit laststicker.com per `sources.md`, push to GitHub, draft Reddit posts for r/PaniniStickers and country-specific subs.

### Deviations from planned scope
None. Session was open-ended (learning masterclass) rather than gated to a specific spec.
