# Spec 05 — Design System v1 (Module 6)

## Goal
Apply the FIFA 26 brand-aligned design system across every surface of the app: the PWA icon, the FirstInventory screen, the Lookup screen, and the reusable component primitives that underpin both. Output: an installable, on-brand app that reads as *the World Cup 2026 sticker app* at glance — not a generic dark-mode utility.

This spec consolidates eight design decisions locked in session 3 (Cowork, 2026-05-26). Every locked decision is non-negotiable here; remaining open questions are flagged in `## Open questions`.

## Why
Modules 1-5 produced a functional app installable on iPhone. Module 6 makes it look like it *belongs* in the World Cup ecosystem — the icon, the typography, the palette, and the structural chrome motif all rhyme with the FIFA 26 brand system without being licensed reproductions. Two-surface design: the operational surface (FirstInventory, Lookup, Inventory browser) stays slate-900 utilitarian and fast; the brand surface (icon, splash, empty states, celebratory moments) channels FIFA-26 directly. The chrome divider line is the single atom that bridges both.

Architectural payoff: one set of tokens, two components reused everywhere (Card, TypePill), and a 3-zone layout that closes the iPhone scroll bug Daniel logged at session 3 open.

## Locked decisions (do NOT relitigate)
Each of these came out of a 4-option exercise in Cowork. They are settled per CLAUDE.md §4.12.

1. **Two-surface framing.** Operational surface = utilitarian / fast / data-forward. Brand surface = FIFA-26 / chunky display digits / saturated palette / chrome detail. Same atoms, different concentrations.
2. **Typography stack.** Display = Archivo Black (sticker codes + icon). Mono = SF Mono / `ui-monospace` (counter, numeric metadata). Sans = SF Pro / `-apple-system` (body, names, labels). Three faces, three jobs.
3. **PWA icon.** Background `fifa-red`. White Archivo Black `00` centered. 2px chrome gradient line bisecting horizontally (mirror motif from the FIFA brand emblem).
4. **Action button colors.** FIFA full palette: Need = `fifa-violet`, Have = `fifa-green`, Dupe = `fifa-orange`. Lookup-screen 4th state (gave-one-away) = `fifa-red`.
5. **Card layout.** 3-zone viewport-fit: top counter (safe-area-inset-top), middle card (flex-1, centered), full-width chrome divider line, bottom action bar (safe-area-inset-bottom). Closes the iPhone scroll bug.
6. **Type pill treatment.** Outlined per-type. 1px border + matching text color, transparent background. PLAYER = `fifa-blue`, BADGE = `fifa-yellow`, LEGEND = `fifa-violet`, SPECIAL = `fifa-teal`, GROUP = `fifa-red`.
7. **Team affiliation.** 5px horizontal stripe at the top edge of the card, jersey-primary color per nation. Only on player and badge types. Empty/omitted on non-team types.
8. **Shiny indicator.** 1.5px chrome gradient border around the entire card (wrapper-frame technique). Binary signal, orthogonal to type. Default Singapore edition: 48 shinies (all badges). European edition: 102 shinies (badges + 54 `s`-suffix players).

## Design tokens

### Color tokens
Define as CSS variables in a new `src/styles/tokens.css` imported at the top of `src/index.css`.

```css
:root {
  /* FIFA 26 brand palette */
  --color-fifa-red:     #D7232A;
  --color-fifa-violet:  #9B5BD2;
  --color-fifa-blue:    #1E40C8;
  --color-fifa-green:   #2BAA4F;
  --color-fifa-orange:  #E55B2A;
  --color-fifa-teal:    #1B8C9E;
  --color-fifa-yellow:  #FFD600;
  --color-fifa-forest:  #1A5C3D;

  /* Operational surface (existing slate, made explicit) */
  --color-bg-app:       #0F172A;  /* slate-900 — app/screen background */
  --color-bg-card:      #1E293B;  /* slate-800 — card body */
  --color-bg-pill:      #0F172A;  /* slate-900 — pill background (transparent in practice, fallback) */
  --color-text-primary: #F8FAFC;  /* slate-50 */
  --color-text-muted:   #94A3B8;  /* slate-400 */
  --color-text-dim:     #475569;  /* slate-600 */

  /* Chrome (metallic detail — icon, divider, shiny border) */
  --color-chrome-mid:   #9CA3AF;
  --color-chrome-high:  #E5E7EB;
  --gradient-chrome: linear-gradient(180deg, #9CA3AF 0%, #E5E7EB 50%, #9CA3AF 100%);
  --gradient-chrome-edge: linear-gradient(135deg, #9CA3AF 0%, #E5E7EB 25%, #9CA3AF 50%, #E5E7EB 75%, #9CA3AF 100%);

  /* Per-type pill colors (text on transparent pill bg, on slate-800 card bg) */
  --type-player-border: #1E40C8;  --type-player-text: #6088E5;
  --type-badge-border:  #FFD600;  --type-badge-text:  #FFD600;
  --type-legend-border: #9B5BD2;  --type-legend-text: #B585E0;
  --type-special-border:#1B8C9E;  --type-special-text:#5BAFBD;
  --type-group-border:  #D7232A;  --type-group-text:  #E55B5B;
}
```

Mirror the FIFA tokens into `tailwind.config.js` `theme.extend.colors` so utility classes like `bg-fifa-red`, `text-fifa-blue` work alongside arbitrary-value support.

### Typography tokens
```css
:root {
  --font-display: 'Archivo Black', system-ui, sans-serif;
  --font-mono:    ui-monospace, 'SF Mono', 'Cascadia Mono', monospace;
  --font-sans:    -apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif;
}
```

Display font loads via Fontsource on jsDelivr (CDN-allowlisted). Add to `package.json`:
```json
"@fontsource/archivo-black": "^5.0.0"
```
And import in `src/main.tsx`:
```ts
import '@fontsource/archivo-black/400.css';
```
(Archivo Black ships at weight 400; the font is already black, no other weights exist.)

### Spacing / radius
Use Tailwind defaults. New constants:
- Card corner radius: `rounded-xl` (12px)
- Chrome shiny-border outer radius: 13.5px (1.5px frame + 12px inner)
- Pill corner radius: `rounded` (4px)
- Button corner radius: `rounded-md` (6px)
- Team stripe height: 5px
- Chrome divider thickness: 2px

## Component primitives (slice 1)

### `<Card>` — `src/components/Card.tsx`
Reusable card primitive used by FirstInventory and (later) Lookup result and Inventory browser.

Props:
```ts
type CardProps = {
  code: string;           // The sticker code, e.g. "BRA1"
  name?: string;          // Display name, e.g. "Marquinhos"
  type: StickerType;      // 'player' | 'badge' | 'legend' | 'special' | 'group'
  teamColor?: string;     // Jersey primary hex; omit to suppress the team stripe
  isShiny?: boolean;      // When true, wrap in chrome-gradient frame
  codeSize?: 'sm' | 'md' | 'lg' | 'xl'; // Defaults 'lg' (44-48px). 'xl' = 80px+ for hero contexts.
};
```

Composition:
```
<ChromeFrame active={isShiny}>
  <CardBody>
    {teamColor && <TeamStripe color={teamColor} />}
    <CardInner>
      <StickerCode size={codeSize}>{code}</StickerCode>
      {name && <CardName>{name}</CardName>}
      <TypePill type={type} />
    </CardInner>
  </CardBody>
</ChromeFrame>
```

`ChromeFrame`: when `active`, applies the gradient-frame technique (padding 1.5px, gradient-edge background, inner card radius 12px, frame radius 13.5px). When inactive, a no-op pass-through (no extra DOM if possible, or a transparent wrapper).

### `<TypePill>` — `src/components/TypePill.tsx`
```tsx
const TYPE_STYLES = {
  player:  { border: 'var(--type-player-border)',  text: 'var(--type-player-text)' },
  badge:   { border: 'var(--type-badge-border)',   text: 'var(--type-badge-text)' },
  legend:  { border: 'var(--type-legend-border)',  text: 'var(--type-legend-text)' },
  special: { border: 'var(--type-special-border)', text: 'var(--type-special-text)' },
  group:   { border: 'var(--type-group-border)',   text: 'var(--type-group-text)' },
};
```
Uppercase label, 8px font (or `text-[8px]` Tailwind arbitrary), `tracking-widest`, `border` 1px solid via inline style for the per-type color, `bg-transparent`, `rounded`, `px-2 py-0.5`.

### `<TeamStripe>` — `src/components/TeamStripe.tsx`
A 5px-tall block with `background` set to the jersey-primary hex. Full card width. Sits at the top edge of the card body (inside the chrome frame if shiny).

### `<ChromeDivider>` — `src/components/ChromeDivider.tsx`
A full-viewport-width 2px line with the chrome gradient. Used between the middle zone and the bottom action zone. Composed via the parent layout, not nested inside the card.

### `<StickerCode>` — `src/components/StickerCode.tsx`
Display digit element. Font = `var(--font-display)`. Sizes:
- `sm` — 24px
- `md` — 32px
- `lg` — 44-48px (default; FirstInventory card body)
- `xl` — 80px+ (Lookup hero result, splash, icon)

Letter-spacing tight: `-0.04em`. Line-height: `0.9`.

### `<ActionButton>` — `src/components/ActionButton.tsx`
```ts
type ActionButtonProps = {
  intent: 'need' | 'have' | 'dupe' | 'subtract';
  label: string;
  onClick: () => void;
};
const INTENT_BG = {
  need: 'var(--color-fifa-violet)',
  have: 'var(--color-fifa-green)',
  dupe: 'var(--color-fifa-orange)',
  subtract: 'var(--color-fifa-red)',
};
```
White text, `rounded-md`, `py-3`, full-width within its grid cell. Tap target ≥44×44.

## Layout adaptation (slice 2)

### FirstInventory + Lookup share a layout component
Create `src/components/ScreenLayout.tsx`:
```tsx
type ScreenLayoutProps = {
  counter: ReactNode;    // top zone — counter + sub-label
  card: ReactNode;       // middle zone — Card or LookupResult
  actions: ReactNode;    // bottom zone — action button row
};
```

Composition:
```
<div className="h-[100dvh] flex flex-col bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
  <header className="pt-[env(safe-area-inset-top)] px-4 py-3 text-center flex-shrink-0">
    {counter}
  </header>
  <main className="flex-1 flex items-center justify-center px-4 min-h-0">
    {card}
  </main>
  <ChromeDivider />
  <footer className="px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] flex-shrink-0">
    {actions}
  </footer>
</div>
```

Notes:
- `100dvh` (dynamic viewport height) so iOS Safari address-bar collapse doesn't cause layout jump.
- `min-h-0` on the flex-1 main allows the card to shrink rather than push the footer offscreen.
- `safe-area-inset-bottom` accommodates the iPhone home indicator without hardcoded padding.
- The chrome divider sits *between* `<main>` and `<footer>`, full viewport width.

### FirstInventory adaptation
Replace the current ad-hoc layout in `src/features/inventory/FirstInventory.tsx` with `<ScreenLayout>`:
- `counter` = `<div className="font-mono">{count} <span className="text-[var(--color-text-dim)]">/ {total}</span></div>` + a muted sub-label `FIRST INVENTORY PASS` in sans, tracked-wide, 8-9px.
- `card` = `<Card code={current.code} name={current.name} type={current.type} teamColor={resolveJerseyColor(current)} isShiny={current.isShiny} />`. `resolveJerseyColor` returns `undefined` for non-team types so the stripe is omitted.
- `actions` = three-button grid (Need / Have / Dupe) via `<ActionButton>` x3.

### Lookup screen adaptation
`src/features/lookup/LookupScreen.tsx` also uses `<ScreenLayout>`:
- `counter` = the search input field (still keyboard-driven, autofocus, exact-match logic intact from spec 03).
- `card` = either the resolved `<Card>` (when a match is found) or an empty-state placeholder.
- `actions` = the context-aware action row from spec 03 (state-dependent: NEED→"Now I have it"; HAVE→"Got a dupe"; DUPE→"Got another" + "Gave one away"). The 4th "Gave one away" button uses `intent="subtract"` = `fifa-red`.

## PWA icon redesign (slice 3)

Replace `public/icon-source.svg` with the new design:
- 512×512 viewBox
- Background: solid `#D7232A` (fifa-red)
- Foreground: `00` in Archivo Black, white `#F8FAFC`, centered, font-size ~290 (so the glyph occupies ~55% of canvas height — sits inside the ~80% safe zone for maskable variant)
- Horizontal chrome line: 2px stroke at vertical midpoint (y=256), full width, gradient applied via `<linearGradient>` definition (`#9CA3AF → #E5E7EB → #9CA3AF`)
- The chrome line passes *behind* the `00`, not above/below — same z-order as the FIFA 26 emblem mirror

Regenerate assets via the existing CLI command (documented in CLAUDE.md):
```
npx @vite-pwa/assets-generator --preset minimal-2023 public/icon-source.svg
```

Verify on iPhone: tap home-screen icon, confirm new red+chrome+00 design renders (not the old slate-900).

## Done criteria
Whole-spec scope. Slice-level done criteria in `## Suggested slices` below.

- Eight design tokens groups defined in `src/styles/tokens.css` and imported.
- Tailwind config extended with FIFA palette aliases.
- Archivo Black loads via Fontsource (verify by `font-family` inspecting the icon `00` element).
- All 6 component primitives created and exported (`Card`, `TypePill`, `TeamStripe`, `ChromeDivider`, `StickerCode`, `ActionButton`).
- `ScreenLayout` component handles safe-area-insets and the chrome divider.
- FirstInventory refactored onto `<ScreenLayout>` — no buttons clip on iPhone 15 / iOS 18 Safari. (Closes the iPhone scroll bug.)
- Lookup screen refactored onto `<ScreenLayout>` — action button colors locked, 4th-state button added.
- PWA icon regenerated with new design; iPhone home screen shows fifa-red icon (not slate).
- Manual smoke on iPhone:
  - FirstInventory: card centered, three action buttons readable, no scroll, chrome divider visible above the buttons.
  - Lookup: type a known code, result card appears with correct team stripe (if applicable), shiny code (`BRA-BADGE` etc.) shows chrome border.
  - Inventory pass complete state still works (no regressions on the inventory-done routing).
- No new console errors. No new tests broken. Vitest suite still green.

## Constraints (from CLAUDE.md)
- One new runtime dep allowed: `@fontsource/archivo-black` (one font, small footprint, CDN-allowlisted).
- No new state library (Zustand only — already loaded).
- No new UI framework (Tailwind primitives + hand-rolled components only).
- Local-first / offline-only must hold — font assets must be served from the bundle, not loaded at runtime from a CDN. Fontsource self-hosts the woff2 files into the Vite build via the npm package import — verify the bundled `dist/assets/*.woff2` exists after build.
- Decorative emojis still allowed per the 2026-05-26 doctrine override; functional glyphs prefer Tabler icons if any are added (none in this spec).

## Out of scope (do NOT build)
- Empty state designs (inventory complete celebration, lookup-no-result placeholder) — deferred to spec 06. The concentric "26" wallpaper pattern is reserved for that scope.
- Animation / motion / transitions — keep all state changes instant for v1. Performance contract is <50ms keypress-to-result; motion adds latency budget we don't have to spend.
- Per-nation jersey-primary lookup beyond a starter set — see Q3 below.
- Inventory browser screen — deferred to spec 07 (the third killer-feature scope). Module 6 only refactors the two screens that already exist.
- Trade-list feature — Module 9.
- Splash screen redesign — vite-plugin-pwa generates a default; iOS scales it acceptably.

## Open questions (decide in plan mode)

**Q1. fifa-orange button contrast.**
`fifa-orange #E55B2A` against white text at button scale measures ~3.2:1 — fails WCAG AA for normal text (needs 4.5:1) but passes for large text (3:1). Button labels at iPhone scale are borderline.

Decision in plan mode:
- (a) Ship as-is. Test on iPhone in daylight — if it reads, accept. If not, address in spec 06.
- (b) Darken `fifa-orange` to ~`#C8431F` (still in-family, ~4.7:1 ratio) and update the locked token.
- (c) Keep `fifa-orange` and use dark text (`#1A1A1A`) on the Dupe button only — asymmetric but solves contrast.

Recommend (a) — defer until on-device test. If unreadable, (b) is the minimal change.

**Q2. Jersey-primary lookup table.**
Per spec 05 lock 7, the team stripe needs a per-nation hex lookup. Two paths:
- (a) Author the full 48-nation table now in `src/data/jerseyColors.ts`. Time cost: ~30 min of looking up jersey primaries. Risk: bikeshedding on every team.
- (b) Author the top 8 favorites for World Cup 2026 (Brazil, Argentina, Germany, France, England, Spain, Netherlands, Portugal). Default all others to neutral slate-700. Add nations incrementally as users actually need them.

Recommend (b) — keeps the slice tight and ships the channel. Add the rest in a data-only update later.

Starter colors (Singapore-default-relevant, jersey-primary):
```ts
export const JERSEY_PRIMARY: Record<string, string> = {
  BRA: '#FFDF00',  // Brazil yellow
  ARG: '#75AADB',  // Argentina sky blue
  GER: '#1A1A1A',  // Germany black (jersey)
  FRA: '#0055A4',  // France blue
  ENG: '#FFFFFF',  // England white (use a thin border instead?)
  ESP: '#C60B1E',  // Spain red
  NED: '#FF6600',  // Netherlands orange
  POR: '#006600',  // Portugal green
  // default fallback handled in component
};
```
**Sub-question Q2a:** England white on slate-900 — visible but very high contrast. Decision: ship as pure white; if it reads too strong, dim to `#D4D4D8` (light gray). Document.

**Q3. Empty-state placeholder during slice 2.**
Lookup with no result — current behavior is a small message. Spec 06 will design this properly. For Module 6, keep the current placeholder but render it inside the `card` zone of `<ScreenLayout>` (i.e., the middle zone shows a small centered "No sticker found for {code}" message).

**Q4. Slice ordering.**
Three slices listed below. Recommend executing in order (foundation → adapt → icon) because slice 2 depends on slice 1's components. Slice 3 (icon) is independent and can run in parallel or as the final step.

## Suggested slices

This spec is too large for a single Claude Code plan-mode session. Three slices, ~30 min each.

### Slice 1 — Tokens + primitives
- Add `src/styles/tokens.css` with all CSS variables.
- Extend `tailwind.config.js` with the FIFA palette.
- Install `@fontsource/archivo-black`; import in `main.tsx`.
- Create the six component primitives. Each with a colocated `.test.tsx` covering render + the per-type/per-intent variants.
- No screen wiring yet. Components exported, type-checked, tested in isolation.

Done when: `npm run test` green, `npm run build` clean, primitives can be imported but no screens use them yet.

### Slice 2 — Layout adaptation
- Create `<ScreenLayout>` component.
- Refactor `FirstInventory.tsx` to use `<ScreenLayout>` + `<Card>` + `<ActionButton>`s.
- Refactor `LookupScreen.tsx` to use `<ScreenLayout>` + `<Card>` (when matched) + the 4-button context-aware action row.
- Author the starter jersey-primary lookup per Q2 recommendation.
- Add `resolveJerseyColor(sticker)` helper that returns the jersey color for player/badge types where the team prefix matches an entry in `JERSEY_PRIMARY`, otherwise `undefined`.

Done when: iPhone smoke test passes (FirstInventory + Lookup both look like the locked mockups, no scroll, no clipped buttons, team stripes appear on the 8 starter nations, shiny chrome border appears on BADGE stickers).

### Slice 3 — PWA icon redesign
- Replace `public/icon-source.svg` with the new red + chrome + 00 design.
- Run the asset generator CLI.
- Commit regenerated PNG assets.
- Reinstall on iPhone (delete old PWA, re-add to home screen) to force icon refresh.

Done when: iPhone home screen shows fifa-red icon with white Archivo Black `00` and visible chrome midline.

## How to use this spec in Claude Code

For each slice, in a fresh Claude Code session in this repo:

```
Read @specs/05-design-system.md (specifically slice N), 
@CLAUDE.md, @journal/log.md (head only), and the existing files this slice will touch.

Enter plan mode.
Propose a plan for slice N only — do not pre-plan later slices.
Stop after the plan — do not write code yet.
```

Review the plan for:
- **All open questions Q1-Q3 addressed explicitly** in a Decisions section.
- **Concrete file diffs named** — what's new, what's modified.
- **No scope creep across slice boundaries** — slice 1 must not touch screens; slice 2 must not regenerate icons; slice 3 must not refactor components.
- **No new runtime deps** beyond `@fontsource/archivo-black`. If Claude proposes anything else, reject and ask why.
- **Acceptance criteria honored** — especially the iPhone smoke test in slice 2.

Approve → execute → diff-review → manual iPhone smoke.

## Decision log
- 2026-05-26 (Cowork session 3) — All 8 design locks made via 4-option exercises. Records preserved in `journal/log.md` session 3 entry.
- 2026-05-26 — `@fontsource/archivo-black` allowed as runtime dep (~30kb, single weight, ships self-hosted via Vite — does not violate offline-first).
- 2026-05-26 — Per-nation jersey lookup deferred to 8-team starter set; full 48 added incrementally as needed.
- 2026-05-26 — fifa-orange contrast flagged as on-device check, not a blocker.
- (add subsequent decisions here as the spec evolves)
