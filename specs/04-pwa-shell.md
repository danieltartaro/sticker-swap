# Spec 04 — PWA Shell (Module 5)

## Goal
Make the app installable to the iPhone home screen as a Progressive Web App with a proper service worker that caches the app shell for full offline use. After this, Daniel can launch the app one-handed at a swap event with a single tap, no URL typing, no network required.

## Why
Modules 1-4 produced a *working web app* — pull up the URL on the phone, it works. Module 5 turns it into something that *feels native*: a home screen icon, full-screen launch (no Safari chrome), offline by default. This is the difference between "neat tool" and "actually useable at a swap event."

`vite-plugin-pwa` is already in `package.json` and configured in `vite.config.ts` with a partial manifest. Module 5 finishes that configuration and adds icon assets.

## Done criteria
- Icon assets generated from a single SVG source, at the standard sizes Vite PWA expects (192×192, 512×512, plus a maskable variant for Android-style adaptive icons even though iOS doesn't use them).
- `vite.config.ts` PWA plugin config completed:
  - Manifest `icons` array populated with the generated PNG paths and sizes.
  - `registerType: 'autoUpdate'` stays — silent updates (no prompt UX needed for v1).
  - `workbox.globPatterns` ensures the app shell + bundled JS/CSS + the catalog JSON are precached.
- `npm run build` produces a valid service worker (`dist/sw.js`) and `dist/manifest.webmanifest`.
- `npm run preview -- --host` serves the production build over LAN so the iPhone can actually install it (dev server doesn't activate the SW).
- Manual smoke on iPhone:
  - Open `http://<laptop-ip>:4173/` in Safari (preview default port).
  - Tap Share → Add to Home Screen → tap the new icon.
  - App launches full-screen, no Safari chrome, looks like a native app.
  - Toggle airplane mode → relaunch from home screen → still works, lookup still works, Dexie still works.
- README's quick-start section updated to mention `npm run preview -- --host` as the install path.

## Constraints (from CLAUDE.md)
- One new devDep allowed: `@vite-pwa/assets-generator` (icon-generation CLI; devDep only, doesn't violate the no-new-runtime-deps rule).
- Icon source must be plain text + color (no decorative emojis per doctrine §4.10).
- Theme stays `#0f172a` (slate-900) per existing manifest config.
- Local-first, offline-only must hold after install — verified explicitly via airplane mode test.

## Out of scope (do NOT build)
- Custom icon design / illustration beyond text-on-color.
- Push notifications.
- Background sync.
- Update-available prompt UX (autoUpdate is silent, that's fine for v1).
- iOS splash screens for every device size (one or two key sizes is enough; iOS will scale).
- Periodic background tasks.
- Web Share API integration.

## Open questions (decide in plan mode)

**Q1. Icon source.** One SVG, 512×512 viewBox. Two options:
- (a) **Text-based, minimal.** Slate-900 background, a bold sans-serif `"SS"` in slate-50, centered. Matches the app's typography. Generic and forgettable but ships in 60 seconds.
- (b) **Text-based with sticker number motif.** Slate-900 background, the code `"00"` in monospaced text (same font family as the in-app counter), centered. Slight thematic nod to "this is a sticker app." Same effort.

Recommend (b) — costs the same, plays better visually with the app's existing typography. Pick one, document the choice.

**Q2. Asset-generation invocation.** `@vite-pwa/assets-generator` runs as a CLI. Two options:
- (a) Run it once manually, commit the generated PNGs to `public/`.
- (b) Wire it into `npm run build` via a `prebuild` script so icons regenerate automatically.

Recommend (a) — icons rarely change, no need to slow every build. Document the CLI command in CLAUDE.md so we can re-run when needed.

**Q3. Workbox precache patterns.** Default `vite-plugin-pwa` precaches everything in `dist/`. Confirm this includes the embedded catalog JSON (it's compiled into the bundle, so it's already in the JS chunks — no separate fetch). Spot-check by inspecting the generated `dist/sw.js` to confirm the catalog isn't being re-fetched from network at runtime.

## Suggested first slice
The whole spec is the slice. Estimated 25-30 minutes.

1. Install `@vite-pwa/assets-generator` as a devDep.
2. Create `public/icon-source.svg` per Q1 choice.
3. Run the generator CLI; commit resulting PNGs to `public/`.
4. Update `vite.config.ts` PWA `manifest.icons` array.
5. `npm run build` → verify clean.
6. `npm run preview -- --host` → install on phone → airplane-mode test.
7. Update CLAUDE.md folder map (`public/` now has icons; mention the regen command).
8. Update README quick-start with the `preview --host` install instruction.

## How to use this spec in Claude Code

In a fresh Claude Code session in this repo:

```
Read @specs/04-pwa-shell.md, @CLAUDE.md, @journal/log.md (head only), 
and @vite.config.ts (current PWA config).

Enter plan mode.
Propose a plan for the full spec — it's a single slice.
Stop after the plan — do not write code yet.
```

Review for:
- **Q1/Q2/Q3 explicitly addressed** in a Decisions section.
- **Concrete `vite.config.ts` diff** in the plan — what the icons array will look like.
- **The generator CLI command** named explicitly so we know what to run.
- **No scope creep** — no push notifications, no splash screens beyond defaults, no update-prompt UX.

Approve → execute → diff-review.

## Decision log
- 2026-05-26 — `@vite-pwa/assets-generator` allowed as devDep (one-time icon generation, doesn't ship to production bundle).
- 2026-05-26 — `autoUpdate` (silent update) over prompt UX — keeps v1 surface small.
- (add subsequent decisions here as the spec evolves)
