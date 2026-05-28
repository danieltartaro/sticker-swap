# Sticker Swap — Journal

> Append-only timeline. Newest entries at top. Each session = one entry. When the journal and the `reference/` / `CLAUDE.md` operating docs disagree, journal wins on facts; the operating docs win on current state. Follows doctrine §7 close protocol.

## 2026-05-28 — Session 6: Module 7 shipped (4 slices) — killer-feature reversal

### What we did
- **Killer-feature reversal (§4.12).** Type-a-code Lookup retired; browse-by-country with tap-to-mark is the new killer feature. Decision came out of two Cowork mock-iteration rounds; 14 design locks captured in `specs/07-killer-feature-reversal.md`. Reasoning: at a swap table with kids handling stickers, browse-by-country beats typing codes on a phone keyboard, and the dupe-tracking surface area never earned its complexity.
- **Slice 1 (View enum + Welcome + routing skeleton).** Extended the `View` union, added `<Welcome>` (centered title + bottom-anchored fifa-green CTA, copy "FWC 2026 Sticker Swap" eyebrow / live count / "Takes ~20 minutes for a sealed album" footnote), rewired `computeInitialView` to land on Welcome on first launch and resume FirstInventory mid-pass.
- **Slice 2 (FirstInventory restructure).** Dropped the third (Dupe) button; added `furthestIndex` + linear-with-rewind arrow nav; added a Reset link wired to a new `<ConfirmDialog>` that wipes-and-reseeds Dexie then routes to Welcome. Counter semantics flipped from reviewed-count to position (`{i+1} / {total}`).
- **Slice 3 (Country Browse + GridCard + done reroute).** New `<CountryBrowse>`, `<CountryPicker>` (bottom-sheet, auto-opens on entry, 48 nations + Specials, sort = most-missing-first with completed countries demoted to 50% opacity at bottom), and `<GridCard>` (2-col, ~152px tall, jersey stripe + code + name + type pill + "Got it" CTA). Got it writes `{ owned: 1, reviewed: true }` synchronously then runs a 220ms opacity+scale fade before DOM removal. Specials pseudo-country (code `'SPE'`) aggregates `type === 'legend' | 'special' | 'group'`; no team stripe on its cards. FirstInventory done branch now routes to `'country-browse'`.
- **Slice 3.5 (visual fidelity patch — Welcome + FirstInventory + ConfirmDialog).** Inserted post-slice-3 after iPhone smoke surfaced drift between the locked PNGs and the shipped Tailwind classes. Synced production JSX verbatim from `mocks/Welcome.reference.tsx` and `mocks/FirstInventory.reference.tsx`. Welcome eyebrow / body / footnote drift fixed.
- **Slice 3.6 (arrow placement fix).** Arrows moved from the actions area into the main slot directly below the Card on FirstInventory, width-matched to the card via `max-w-[280px]` with `mt-4` gap. Big vertical gap now falls between the arrow row and the Need/Have row, not between the Card and the arrows.
- **Slice 4 (this entry) — Lookup deletion + docs + journal.** Deleted `src/features/lookup/` (folder + 5 files). Removed `'lookup'` from the `View` union. Updated `src/lib/routing.ts` + `routing.test.ts` to land on `'country-browse'` when the pass is complete. Rewrote `CLAUDE.md` "What this is" (browse-by-country leads), deleted "Performance contract", swapped the `Sticker.owned` field comment to reflect dupe retirement, added `mocks/` to the Folder map, added the §4.12 reversal example to the doctrine notes. Prepended a session-6 block to `learnings.md` with three promoted lessons + one carry-forward.
- **Mocks-as-authoritative process discipline (NEW doctrine).** Mid-module after slice 2 surfaced "Claude Code interprets layout from a PNG and invents Tailwind classes that look close" drift, we adopted a two-layer discipline: PNGs in `mocks/` are the visual source of truth ("PNG wins when spec prose disagrees"); for screens where Tailwind-class fidelity matters, commit a `mocks/<Component>.reference.tsx` alongside the PNG and copy JSX verbatim into production. Currently set: `Welcome.reference.tsx`, `FirstInventory.reference.tsx`.

### Decisions locked
- **Killer feature is browse-by-country with tap-to-mark.** Type-a-code Lookup retired. Two-surface framing (operational + brand) from spec 05 still holds.
- **Dupe concept retired from the UI.** First pass = Need / Have only. CountryBrowse never sees an owned sticker. `Sticker.owned` stays a `number` but no code path sets it to `>=2`. Trade module concept (was Module 9) dissolves; replacement scope TBD.
- **No "lost / unmark Have" path.** Reset is the only undo in v1.
- **Welcome screen** is the first-mount + post-Reset surface. Mid-pass resumes FirstInventory directly.
- **Linear-with-rewind FirstInventory.** Arrows visible per `currentIndex > 0` (left) and `currentIndex < furthestIndex` (right). Decisions advance the leading edge; right arrow never advances past furthestIndex.
- **Reset = full wipe + reseed → Welcome.** Confirm dialog: dark slate card, outlined cancel, fifa-red destructive confirm.
- **Country picker auto-opens on CountryBrowse mount; no persisted last-country.** Revisit only if real swap-event signal demands it.
- **Specials pseudo-country code = `'SPE'`** for routing/filtering. Aggregates `type === 'legend' | 'special'` only. No team stripe on grid cards; swatch is fifa-violet (`#9B5BD2`) with a white star icon. Sort: pinned to the top of the incomplete bucket in the picker; alphabetical among completed countries. *Three post-slice-4 amendments (this session, immediately after CountryBrowse smoke):* (A) swatch changed from fifa-red to fifa-violet — red + centered white star at thumbnail size read as the Vietnam flag; purple is uniquely absent from national flags. (B) `'group'` type removed from Specials membership — team photos (BRA13, MEX13, …) are country-attributable and belong under each team's grid. Brazil showed 19 missing instead of 20 on iPhone smoke because BRA13 was being swept into Specials. Effect: each country gains its team-photo sticker; Specials count drops by ~48. (C) Sort order amendment: Specials now pinned ahead of every country when incomplete — after Amendment B, Specials and fresh countries could tie on missing count, and alphabetical tie-break put Specials between R and T in the picker; Daniel called it as a meta category that should always read first. Spec 07 Lock 8 + Lock 9 carry these amendments.
- **Compact `<GridCard>` is a new component** (chose new component over extending `Card` with a size prop).
- **In-app text links = fifa-yellow underlined** (`var(--color-fifa-yellow)`, `#FFD600`). Per the post-slice-2 amendment to lock 13 — the earlier "white nav / fifa-red destructive" reading was wrong; yellow is the locked tap-affordance color for all in-app links.
- **Arrow style on FirstInventory = fifa-yellow chunky filled triangles.** SVG path: `M22 4 L6 16 L22 28 Z` (left) / `M10 4 L26 16 L10 28 Z` (right). 32×32 SVG inside ≥44×44 tap target. Placed in the MAIN slot directly below the Card, width-matched via `max-w-[280px]`.
- **`mocks/` is the visual source of truth.** PNG wins when spec prose disagrees. `.reference.tsx` files are the anti-drift mechanism for Tailwind-class fidelity.

### Findings (promoted to learnings.md)
- **Mocks-as-authoritative discipline.** For any feature with visual taste involved, commit a PNG to `mocks/` before slice planning. Slice prompts cite the PNG path explicitly; plan-mode reviews flag every deviation for approval before code is written. When the spec text and the PNG disagree, the PNG wins and the spec gets amended. Two iterations of drift in this module made this load-bearing.
- **`.reference.tsx` files defeat Tailwind-class drift.** Slice 3 surfaced a second drift mode that PNGs alone can't fix: Claude reads a PNG as an image, then *invents* Tailwind classes that are "close enough" but not the locked values. Mitigation: commit `mocks/<Component>.reference.tsx` — a full JSX tree with every class, inline style, copy, and SVG path locked. Production components copy verbatim. The reference file is NOT imported by production; it exists only as a copy-paste source. When production drifts, run a "visual fidelity patch" slice that re-syncs from the reference.
- **§4.12 reversal at full-feature scale works — delete, don't deprecate.** A load-bearing decision (the entire killer feature + its `<50ms` performance contract) can be retired mid-project under §4.12, provided the reversal is captured in a spec + journal entry + CLAUDE.md rewrite. Don't soften the reversal with vestigial code (keeping an unreachable Lookup screen "just in case") — delete the folder. The next session inherits a clean codebase rather than a graveyard, and `grep -r "old-feature" src/` becomes the canonical regression test.

### Findings (carry-forward only — not promoted)
- **Country-browse reference .tsx files not yet built.** `CountryBrowse.reference.tsx`, `CountryPicker.reference.tsx`, `GridCard.reference.tsx` deferred at end-of-session-5b in favor of going straight to slice 4. Country-browse screens haven't been smoke-tested for visual drift; build the references before any future feature work touching those screens.
- **Slice 4 ran across two sessions but only executed in one.** Claude Code session (Cowork-spawned earlier) generated the full slice-4 plan, then hit a context cap before plan approval / execution. Nothing actually shipped from that leg. Follow-up Cowork session (this one) read `journal/handoff-2026-05-28.md`, received the unchanged plan from the prior leg pasted back in chat, and executed it end-to-end. Promoted to learnings.md as a failure mode: when a Claude Code session's plan-mode hits context limit, the in-flight state is *plan only*, not partial execution — but a follow-up session can mistake the plan for a partial execution if it sees stale signals (in this case, a misread of an early Glob that suggested the lookup folder was gone). Cross-check destructive operations with `bash ls` before assuming they happened.
- **macOS Screenshot filename U+202F gotcha.** macOS Screenshot's "Screenshot 2026-05-28 at …" filenames embed a NARROW NO-BREAK SPACE (U+202F), not a normal space, between "Screenshot" and the date. Any scripted file handling (renames, globs, shell pipelines) needs explicit quoting/escaping or the path silently mis-matches. Now documented in CLAUDE.md Folder map.

### Files touched
- **Deleted:** `src/features/lookup/` entire folder — `LookupScreen.tsx`, `lookupLogic.ts`, `lookupLogic.test.ts`, `inventoryDone.ts`, `inventoryDone.test.ts`. (Required `mcp__cowork__allow_cowork_file_delete` since `rm` returned EPERM on the iCloud-mounted bash sandbox until permission was granted.)
- **Modified:** `src/App.tsx` (drop `LookupScreen` import + `case "lookup"` arm), `src/store/view.ts` (drop `'lookup'` from `View` union), `src/lib/routing.ts` (`mapCountsToView` returns `'country-browse'` when pass complete), `src/lib/routing.test.ts` (test rename + expectation update, drop stale slice-3 comment), `src/data/types.ts` (`owned` field gets the dupes-retired comment), `CLAUDE.md` (What this is rewrite, Performance contract section deleted, Data model `owned` comment, Folder map +`mocks/` + country-browse / -lookup, doctrine §4.12 reversal example added), `journal/log.md` (this entry), `learnings.md` (prepended session-6 block: three promoted lessons + slice-in-flight failure mode).
- **Untouched but in scope:** Module 7 spec, slice prompts, mocks/ PNGs, mocks/Welcome.reference.tsx, mocks/FirstInventory.reference.tsx — all stay as-shipped.

### Open queue going into session 7
1. **iPhone smoke of the full Module 7 flow.** Welcome → first pass (Need + Have, arrow-rewind) → done branch routes to Country Browse → picker auto-opens → pick Brazil → Got it on 2 stickers → fade + DOM removal → reopen picker → Specials → Got it → reload (PWA persisted writes survive). Confirm no flash of an old Lookup screen anywhere.
2. **Country-browse `.reference.tsx` files** — build `CountryBrowse.reference.tsx`, `CountryPicker.reference.tsx`, `GridCard.reference.tsx` before any future visual change to those screens. Mocks-as-authoritative discipline now applies to every visually-meaningful surface.
3. **Spec 06 reassessment.** Two deferred items still apply: all-done celebratory empty-state card, color-collision team-text label. Lookup-no-result is moot — gone with Lookup.
4. **Module 8 scope.** What's next now that Lookup is retired and the trade module concept has dissolved? Candidates: JSON export, share-a-want-list link, alternative-edition toggle (European 1,034). Decide in `/office-hours`.
5. **Portfolio-contract inheritance question** (carry from session 5) — decide whether `sticker-swap/CLAUDE.md` should chain through `public-products/CLAUDE.md` like `simply-currency` does. Line-3 flag on CLAUDE.md still points to this.
6. **`mocks/.DS_Store` sweep** if it slipped into the repo. Cosmetic.

### Deviations from planned scope
- **Slice 4 split across two sessions, executed in one.** Claude Code session generated the plan in plan-mode but hit context cap before execution. Follow-up Cowork session (this one) read the handoff, received the same plan pasted back from the prior leg, and shipped the work. Execution venue moved from Claude Code to Cowork because (a) the plan itself was already locked, and (b) the remaining work was mechanical (deletions + doc edits). A faulty early Glob initially suggested the lookup folder was already deleted; corrected via bash `ls` mid-session. Lesson promoted: always cross-check "this looks already done" claims against a second tool before acting on them.
- **Country-browse reference .tsx files deferred.** Originally part of the post-slice-3 visual-fidelity work; explicitly deferred end-of-session-5b in favor of going straight to slice 4 per Daniel's call. Logged in carry-forwards above and in the session-7 open queue.

## 2026-05-26 — Session 5: shipped — GitHub + Vercel + launch drafts + portfolio reorg

### What we did
- **iPhone smoke (session 4 carry-forward, 3 items): all green.** Slice 3 icon (fifa-red + white "00" + chrome midline) renders correctly post-PWA-reinstall. Slice 4: Card dimensions match across FirstInventory and Lookup (POR17 side-by-side), new jersey stripes show (MEX/JPN/KSA/BEL/CRO), All-done CTA transitions cleanly to Lookup via the "Start swapping" button. Daylight Q1 on fifa-orange Dupe: readable, no carry-forward.
- **Git pre-init audit caught five stale files.** Cowork-side sweep before `git init` flagged `vite.config 2.ts` (macOS Finder duplicate from iCloud sync), `vite.config.js` + `vite.config.d.ts` (accidental compile outputs of vite.config.ts, never imported), both `*.tsbuildinfo` files (TS incremental cache), and `.DS_Store`. All deleted. Tests 53/53 + 306 KB build remained green after cleanup, confirming the deleted files weren't load-bearing. Also caught `.claude/settings.local.json` containing `/Users/danieltartaro/.claude/settings.json` — a home-directory path leak — gitignored before commit. Secret-pattern sweep on `(api[_-]?key|secret|token|password|BEGIN.*PRIVATE)` returned only false positives (FIFA design "tokens", "secret"/"password" appearing as prose words in journal entries).
- **Git init + first commit, then GitHub push.** `git init -b main`, configured user, single commit `1f45db2` covering Modules 1-6, 60 files, 432 KiB local → 160.5 KiB after pack compression. Daniel created `github.com/danieltartaro/sticker-swap` (public, no README/license/.gitignore boxes) on the GitHub UI. Push initially failed with "Password authentication is not supported" — fixed via `brew install gh && gh auth login` (HTTPS + web browser device-code flow), which cached PAT in macOS keychain. Subsequent `git push -u origin main` succeeded silently. 75 objects pushed.
- **Vercel deploy via GitHub connect.** Live at `https://sticker-swap-phi.vercel.app/` (the `-phi` suffix because `sticker-swap.vercel.app` was taken). Vite's `base: '/'` default + relative manifest paths meant zero code changes for deploy. Vercel auto-detected the Vite framework, build/output/install settings pre-filled correctly. ~60s build. PWA HTML loaded with correct `<title>` but `mcp__workspace__web_fetch` couldn't directly verify `manifest.webmanifest` and `sw.js` from Vercel due to provenance restrictions — verification deferred to on-device install (carry-forward).
- **Distribution-surface split forced two URL leads.** FB-post question surfaced that the README's install path was developer-only (`clone + npm install + preview --host`). For non-dev audiences (parents in a Singapore swap group), that's a wasted post. Two fixes: (a) deploy to Vercel (above), (b) rewrite README to lead with the hosted URL + "Add to Home Screen" path, with source-install as the secondary section. Reddit drafts were also updated mid-session to lead with the Vercel URL, then **reverted at Daniel's call** ("reddit keep the repo") — Reddit audience overlaps with devs who care about source + JSON, so Reddit drafts now lead with `github.com/danieltartaro/sticker-swap` and the Vercel URL stays in README + FB post only.
- **FB post for Singapore swap group written.** Plain text (FB doesn't render Markdown), Singapore-edition framing (980 stickers / 48 emblem shinies, no European 1,034 / s-suffix mention — irrelevant to this audience), short paragraphs for FB rendering, "Add to Home Screen" install path inline. Stored as Post 4 in `scratch/reddit-drafts.md` (still gitignored).
- **iOS + Android install instructions written.** Plain text, copy-paste-ready. Suggested as a first-comment under the FB post rather than inline (keeps the main post short, FB-readable). Called out the iOS-specific gotcha: Chrome on iPhone can't add PWAs because it wraps Safari WebView — Safari mandatory on iOS.
- **Folder move: `/AI/sticker-swap/` → `/AI/public-products/sticker-swap/`.** Daniel's call. Sticker-swap joins the portfolio cohort as sibling to simply-currency. 193 MB moved cleanly (mostly node_modules, same iCloud volume so no re-sync). Git remote intact, branch tracking preserved post-move, no orphan files. CLAUDE.md doctrine path updated from `../DOCTRINE.md` to `../../DOCTRINE.md`. Portfolio-contract inheritance question (whether to chain through `../CLAUDE.md` like simply-currency does) deliberately deferred — sticker-swap diverges from simply-currency's profile (PWA not iOS, solo not designer-led, MIT not paid) and the parent contract describes itself as for "shipped iOS apps designed in collaboration with a freelance designer." Inheritance decision belongs to a deliberate next-session opener, not a folder-move side effect.
- **Second commit pushed.** README hosted-URL rewrite + CLAUDE.md path fix landed as commit `d407b35` on the freshly-moved local. Vercel auto-redeployed (no app changes, harmless rebuild). GitHub UI now shows the "Try it" Vercel link prominently in README — material for anyone clicking through from a Reddit/FB post.
- **Spec 06 deferred.** Daniel's §4.14 optimization-function call: "use it at a swap event + give Reddit a clean JSON" both ship now; empty-state polish is speculative without real-world signal. Three deferred items remain on file: Lookup no-result placeholder, All-done celebratory card content, color-collision team-text label.

### Decisions locked
- **Default Reddit framing leads with GitHub repo URL, not hosted URL.** Reddit's dev overlap cares about source + JSON; the app is the secondary lure. FB and other non-dev surfaces get the hosted URL as primary.
- **Default FB / non-dev framing leads with `sticker-swap-phi.vercel.app`.** Install is "open URL → Add to Home Screen → done." GitHub repo is invisible to this audience.
- **Sticker-swap joins `public-products` portfolio.** Folder reorg complete. Sibling to simply-currency. Portfolio-contract inheritance question is open (CLAUDE.md line 3 flag).
- **Spec 06 deferred until real swap signal.** §4.14 call. No timeline. Reopen only if a swap event surfaces something the locked design can't handle.
- **Hosted-deployment vendor: Vercel** (not GitHub Pages). PWA performance behind a real CDN; root-domain serving (no `base` path config); auto-deploy on push.
- **GitHub auth path on macOS: `gh auth login`** via HTTPS device-code flow. PAT cached in keychain after one round-trip. Beats both raw HTTPS-with-PAT-as-password (which GitHub deprecated in 2021) and SSH-key setup (3+ steps, GitHub UI navigation) for one-off pushes.
- **`.gitignore` additions, locked:** `*.tsbuildinfo`, `*\ 2.ts` (catches macOS Finder duplicates project-wide), `vite.config.js`, `vite.config.d.ts`, `.claude/settings.local.json`. The Finder-duplicate glob is the surprising one — iCloud sync occasionally produces `filename 2.ext` orphans that get committed unless caught.

### Findings (promoted to learnings.md)
- **Pre-init working-tree audit before any first commit.** Five stale files would have shipped to GitHub without it. Build artifacts, Finder duplicates, personal-info leaks all hide in plain sight if `git add .` runs blindly.
- **`gh auth login` is the right macOS GitHub auth path post-2021.** One-time browser device-code flow → cached in keychain → silent thereafter. Cleaner than HTTPS-with-PAT-paste or SSH key generation for solo pushes.
- **Non-dev distribution requires a hosted URL, not a GitHub README.** Surface this question before doing OSS launch comms — deploying a static PWA takes ~10 min on Vercel and unblocks every non-dev audience.
- **Reddit and FB audiences need different lead URLs.** Same project, two surfaces, two primary links. Reddit gets source; FB gets the install path. Don't homogenize launch material across surfaces with different overlap profiles.

### Findings (carry-forward only — not promoted)
- **HTML `meta theme-color` is `#0f172a`; manifest `theme_color` is `#D7232A`.** Probably intentional per the two-surface framing (HTML meta colors the browser address bar = operational surface; manifest colors the install splash = brand surface). Unverified on the hosted Vercel install — carry-forward to first iPhone smoke of the production URL.
- **Vercel-domain randomization.** `sticker-swap.vercel.app` was already taken; we got `sticker-swap-phi.vercel.app`. Cosmetic only, but worth knowing — if Daniel wants the clean subdomain later, Vercel Pro lets him claim a custom domain. Not blocking.
- **Daniel reverted my mid-session edit to Reddit drafts.** I'd added Vercel URLs to Reddit Post 1 and Post 2; Daniel said "reddit keep the repo." Reverted both. Pattern worth naming: optimization heuristics ("hosted URL is better UX") can override audience-fit ("Reddit cares about source") in my plan unless explicitly framed. Catch is to ask which audience gets which framing before mass-applying a "consistency" change.

### Files touched
- **New:** repo on `github.com/danieltartaro/sticker-swap`, production deployment at `sticker-swap-phi.vercel.app`, two commits (`1f45db2` initial + `d407b35` README + CLAUDE.md)
- **Modified (in-repo):** `README.md` (lead with Vercel URL, source-install section preserved below), `CLAUDE.md` (doctrine path `../DOCTRINE.md` → `../../DOCTRINE.md` + portfolio inheritance flag), `.gitignore` (+ `*.tsbuildinfo`, Finder dup glob, vite.config compile outputs, `.claude/settings.local.json`)
- **Modified (gitignored):** `scratch/reddit-drafts.md` (filled `<REPO_URL>` + `<JSON_URL>` placeholders with real URLs, reverted Vercel mid-session per Daniel's "reddit keep the repo", added Post 4 = Singapore FB draft + iOS/Android install instructions)
- **Deleted:** `vite.config 2.ts`, `vite.config.js`, `vite.config.d.ts`, `tsconfig.tsbuildinfo`, `tsconfig.node.tsbuildinfo`, `.DS_Store`
- **Moved:** `/AI/sticker-swap/` → `/AI/public-products/sticker-swap/` (entire 193 MB folder, single `mv`)
- **No source files touched.** No tests added, no components changed. Distribution / deployment / docs only.

### Open queue going into session 6
1. **Daniel posts Reddit threads.** Drafts ready in `scratch/reddit-drafts.md`. Suggested order: r/PaniniStickers first → watch 24h → country subs one at a time (r/futebol, r/Brasil, r/futbolmx, r/coupedumonde, r/Soccer last) → r/webdev/r/reactjs optional. Comment-reply boilerplate in pocket.
2. **Daniel posts the Singapore FB swap group.** Post 4 in `scratch/reddit-drafts.md`. iOS + Android install instructions ready to drop as a first comment.
3. **Production-URL iPhone install verification.** Daniel confirmed slice 3 install from the LAN preview; should also confirm from `sticker-swap-phi.vercel.app`. Verifies `manifest.webmanifest` and `sw.js` resolve correctly from Vercel CDN (Cowork-side `web_fetch` couldn't due to provenance). Also catches the HTML-meta vs manifest `theme_color` divergence if it presents as a problem.
4. **Portfolio-contract inheritance decision.** Read `public-products/CLAUDE.md` fully, decide whether sticker-swap should chain through it like simply-currency does. Sticker-swap diverges (PWA, solo, MIT) — could go either way. CLAUDE.md line 3 flag points to this.
5. **Possible bilingual FB post.** If Singapore group is mixed English + Mandarin, Daniel wants a Mandarin version too. On hold pending Daniel's recon of the group's posting culture.
6. **Possible spec 06.** Only if real swap-event signal demands. Three deferred items: Lookup no-result placeholder, All-done celebratory card, color-collision team-text label.

### Deviations from planned scope
- Session 4's open queue had 6 items. 5 of 6 closed this session, 1 (Reddit posts) carries forward as a Daniel-side task. **Bonuses absorbed mid-session** (not in session 4's open queue): Vercel deployment (forced by the FB-post non-dev audience question), README rewrite to lead with hosted URL (forced by the deployment), FB post + iOS/Android install instructions (Daniel's explicit ask), folder reorg into `public-products/` (Daniel's explicit ask), second commit + push. Honest expansion captured per §4.5 — driven by Daniel's directional pulls, not scope creep.
- Daniel's "reddit keep the repo" reversed a mid-session edit. Captured above as a finding (carry-forward only). Not a deviation per se — the edit was an unrequested optimization that didn't match his audience-segmentation intent.
- Spec 06 was carried into session 5 from session 4's open queue. Deferred mid-session per §4.14. Counted as a decision, not an unmet commitment.

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
