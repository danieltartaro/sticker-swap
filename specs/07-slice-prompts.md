# Spec 07 — Slice prompts (paste-ready)

These are the verbatim prompts Daniel pastes into a fresh Claude Code plan-mode session for each slice of Module 7. Reference: `specs/07-killer-feature-reversal.md`.

Recommended gstack entry: `/office-hours` for slice 1 (significant doctrine reversal — earns the full Think pass), then plain plan-mode for slices 2-4 (mechanical execution against a now-frozen spec). `/autoplan` if you want CEO + design + eng + DX review collapsed into one.

---

## Slice 1 — View enum + Welcome + routing skeleton

```
Read @specs/07-killer-feature-reversal.md (slice 1 specifically, plus the
Locked decisions and Routing model sections), @CLAUDE.md, and
@journal/log.md (head entry only).

This slice is the foundation of a §4.12 reversal of the app's killer
feature. Lookup is being retired and replaced with country-browse. Today's
goal is small: extend the view union, add a Welcome screen, and wire the
launch-time routing so first-launch lands on Welcome and resume keeps
working. Lookup stays alive for this slice — slice 4 deletes it.

Enter plan mode. Propose a plan for slice 1 only — do not pre-plan
slices 2-4.

In the plan, address explicitly:
- Q1 from the spec (Welcome screen copy) — propose copy, flag for Daniel approval.
- Q5 (Reset reseed) — verify the existing seed flow is callable post-clear.
  This isn't built in slice 1 but the verification informs slice 2.
- Concrete file diffs: what's new, what's modified.
- Existing tests that need updating (view-store consumers most likely).

Stop after the plan — do not write code yet.
```

---

## Slice 2 — FirstInventory restructure

```
Read @specs/07-killer-feature-reversal.md (slice 2 + Locked decisions 5,6,7,13,14),
@CLAUDE.md, @journal/log.md (head + previous slice's entry),
@src/features/inventory/FirstInventory.tsx, @src/components/ScreenLayout.tsx,
@src/components/ActionButton.tsx.

This slice restructures FirstInventory: drop Dupe button, drop the
'dupe' branch in handleAction, add a furthestIndex/currentIndex pair with
linear-with-rewind arrow nav, add a Reset link that wipes + reseeds the DB
and routes to Welcome via a new ConfirmDialog component, and change the
counter from reviewed-count to position. Apply the link/arrow color
treatment from lock 13/14.

Enter plan mode. Propose a plan for slice 2 only.

In the plan, address explicitly:
- Q2 (arrow color) — pick white or muted gray with reasoning.
- ConfirmDialog as a new reusable component (location, prop shape).
- How the DB wipe + reseed works without orphan state (Q5 from slice 1's
  verification should answer this).
- Whether ActionButton's `dupe` intent stays in the type union (yes — used
  by ConfirmDialog's destructive variant via `subtract`).
- Tests to add: position-counter math, arrow visibility rules, reset flow.

Stop after the plan — do not write code yet.
```

---

## Slice 3 — Country Browse + GridCard + done-state reroute + slice-2 color fix

```
Read @specs/07-killer-feature-reversal.md (slice 3 + Locked decisions
8,9,10,11,12 + the Amendment block at the bottom of the spec —
specifically the "Visual source of truth", "Lock 13 amendment", and
"Lock 14 amendment" subsections), @CLAUDE.md, @journal/log.md (head +
slice 2 entry), @src/components/Card.tsx, @src/components/TypePill.tsx,
@src/data/jerseyColors.ts, @src/features/inventory/FirstInventory.tsx
(the done branch + the Reset link + the arrow row).

Then look at every PNG in @mocks/ — these are the authoritative visual
source of truth. When the spec text and a PNG disagree, the PNG wins.
Specifically for this slice:

- @mocks/07-country-picker.png — the picker overlay you must match
- @mocks/07-country-browse-grid.png — the grid layout you must match
- @mocks/07-country-browse-complete.png — the empty state you must match
- @mocks/07-first-inventory-rewound.png + @mocks/07-first-inventory-mid-pass.png
  — these show the slice-2 arrow color/style. Slice 2 shipped muted-gray
  thin chevrons; the PNG locks fifa-yellow chunky filled triangles. Same
  for the Reset link: slice 2 shipped fifa-red; PNG locks fifa-yellow.
  Both fix in THIS slice as a folded-in carry-forward.

Scope this slice:

1. Country Browse killer-feature build:
   - New `src/features/country-browse/CountryBrowse.tsx` + `CountryPicker.tsx`.
   - GridCard (either extend Card with `size: 'lg' | 'md'` prop, or new
     `src/components/GridCard.tsx` that composes existing primitives —
     pick in plan mode and justify).
   - Dexie filter: `owned === 0` AND code-prefix-matches selected country.
     Specials pseudo-country matches `type === 'special' || 'legend' ||
     'group'`.
   - Got it button writes `{ owned: 1, reviewed: true }`, 220ms
     opacity+scale fade, card removed from DOM.
   - Wire FirstInventory's done branch from setView('lookup') to
     setView('country-browse').

2. Slice-2 color carry-forward (folded into this slice):
   - Patch Reset link in FirstInventory from fifa-red to fifa-yellow
     underlined.
   - Patch arrow components from muted-gray thin chevrons to fifa-yellow
     chunky filled triangles (mirror the PNGs' arrow shape).

Welcome screen is locked at slice 1 shipped state (green CTA, matches
@mocks/07-welcome.png). Do not touch.

Enter plan mode. Propose a plan for slice 3 only.

In the plan, address explicitly:
- Q3 (Compact Card path) — pick (a) extend Card, or (b) new GridCard.
- Q4 (picker first-mount dismissability).
- Q6 (Specials pseudo-country code).
- Jersey-swatch near-bg detection: how to detect, where the check lives.
- Got it animation: 220ms opacity+scale, DB write order vs fade order.
- Tests: country-prefix filter, specials matcher, picker sort order.
- Slice-2 carry-forward patches (Reset link fifa-yellow, arrows yellow
  chunky filled triangles): list the exact files touched and confirm
  no test regressions.

Stop after the plan — do not write code yet.
```

---

## Slice 3.5 — Visual fidelity patch (Welcome + FirstInventory + ConfirmDialog)

Inserted post-slice-3 after iPhone smoke surfaced visual drift between the
locked PNGs and the shipped implementation. The fix is mechanical: copy
JSX from the reference .tsx files into production. No new feature work.

```
Read @mocks/Welcome.reference.tsx and @mocks/FirstInventory.reference.tsx.
These are the visual source of truth. Every Tailwind class, every inline
style, every piece of copy, every SVG path is locked.

Read @src/features/inventory/Welcome.tsx,
@src/features/inventory/FirstInventory.tsx, and
@src/components/ConfirmDialog.tsx — these are the production components
that diverged from the locks.

Enter plan mode. Propose a plan that does ONE thing: patch the production
files to match the reference files exactly.

Rules:
- Copy JSX trees verbatim from the references into production. Same
  classes, same inline styles, same SVG paths, same copy.
- Preserve all production behavior: state hooks, effect logic, event
  handlers, db calls. The references hardcode sample values; production
  keeps its live data. Only the JSX changes.
- Do NOT "improve" Tailwind classes, do NOT substitute "equivalent"
  utilities, do NOT collapse styles, do NOT change copy.
- Welcome eyebrow MUST read "FWC 2026 Sticker Swap" (the implementation
  currently has "STICKERS TO FIND" — wrong).
- Welcome body MUST start with "stickers to find. " (the implementation
  dropped this prefix — wrong).
- Welcome footnote MUST be "Takes ~20 minutes for a sealed album" (the
  implementation omitted this — wrong).
- FirstInventory Card body MUST have NO border (the implementation added
  a visible outline — wrong). Only the team-color stripe at top.
- FirstInventory Need/Have buttons MUST be `rounded-2xl` (the
  implementation appears less rounded — wrong).
- FirstInventory arrows MUST be the chunky filled-triangle SVG from the
  reference (the implementation may have used thinner glyphs — verify).
- ConfirmDialog cancel button MUST be outlined gray; confirm MUST be
  fifa-red (per the locked palette and the reference).

In the plan, address explicitly:
- Side-by-side diff: cite which JSX subtree in each production file gets
  replaced with which subtree from the reference.
- Behavior preservation: how state/effects/handlers stay intact while JSX
  swaps.
- Tests impacted: none, expected (these are pure visual swaps). If any
  test breaks, that's a signal something behavioral was caught up in the
  swap — investigate before completing.
- Verification: visual diff on iPhone smoke against the four PNGs
  (`07-welcome.png`, `07-first-inventory-fresh.png`,
  `07-first-inventory-rewound.png`, `07-first-inventory-mid-pass.png`).

Stop after the plan — do not write code yet.
```

---

## Slice 4 — Delete Lookup + docs + journal

```
Read @specs/07-killer-feature-reversal.md (slice 4 + the §Modified subsections
for CLAUDE.md, journal/log.md, src/data/types.ts), @CLAUDE.md (full),
@journal/log.md (full head + last 2 entries).

This slice is mostly deletions and documentation. Delete
`src/features/lookup/` entirely. Remove `'lookup'` from the View union.
Rewrite CLAUDE.md's "What this is" and delete "Performance contract".
Update the `owned` field comment in src/data/types.ts. Append a journal
session-6 entry documenting the §4.12 reversal.

The journal entry must follow doctrine §7 format: "What we did",
"Decisions locked", "Findings (promoted to learnings.md)", "Findings
(carry-forward only)", "Files touched", "Open queue going into session 7",
"Deviations from planned scope". The §4.12 reversal is the headline.

Enter plan mode. Propose a plan for slice 4 only.

In the plan, address explicitly:
- Exact CLAUDE.md sections to rewrite, with proposed new copy. Include
  the new `mocks/` folder at repo root in the Folder map (it's the
  visual source-of-truth folder, captured 2026-05-28).
- Exact deletions: which files, which imports.
- The journal entry's "Findings" section — what should be promoted to
  learnings.md from this whole module's experience. At minimum, the
  "mocks-as-authoritative" pattern (commit PNGs to a `mocks/` folder
  before slice planning, cite them in slice prompts, PNG-wins-when-spec-
  prose-disagrees) is a doctrine-level learning worth promoting.
- The CLAUDE.md should also document the ` ` (NARROW NO-BREAK SPACE)
  gotcha in macOS Screenshot filenames as a one-line carry-forward for
  any future scripted file handling.
- Verification: `grep -r "features/lookup" src/` returns zero, build clean,
  tests green, dist size < 320 KB.

Stop after the plan — do not write code yet.
```

---

## After each slice — close protocol

Per doctrine §7. Before opening the next slice:

1. Daniel reviews the diff + manual iPhone smoke.
2. Append an entry to `journal/log.md` (newest at top) covering: what we
   did, decisions locked, findings, files touched, open queue.
3. Append to `learnings.md` if any new lesson promoted.
4. Update CLAUDE.md only if current state changed (slice 4 does this
   wholesale; earlier slices likely don't need it).
5. Confirm to Daniel in 1-2 lines.

---

## Doctrine §4.12 reminder

This whole module is a reversal of a load-bearing decision in CLAUDE.md
(the killer feature + performance contract). The journal entry in slice 4
must explicitly cite §4.12 and document:
- What decision was reversed.
- What new evidence or call triggered the reversal (Daniel's mockup +
  country-browse design session, 2026-05-28).
- That the reversal was surfaced and confirmed (not silently re-framed) —
  per the Cowork conversation that produced this spec.

If a future Claude Code session reads CLAUDE.md and the journal and gets
confused about whether the type-a-code feature exists, the slice 4 journal
entry is the source of truth.
