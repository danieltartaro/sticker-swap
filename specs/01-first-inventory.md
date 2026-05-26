# Spec 01 — First Inventory Mode

## Goal
A one-time-use UI that lets Daniel and his son rapidly mark which of the ~670 FIFA WC 2026 Panini stickers they own. Target: complete the full pass in **<45 minutes**, across two sittings.

## Why
First inventory is the blocker for everything else. Without it, the lookup screen (the killer feature in `src/features/lookup/`) has nothing to look up. This unblocks v1 shipping to the next swap event.

Pure manual entry is the chosen path. We evaluated and rejected photo-based ingestion for v1 — engineering cost was 5-10× the manual approach with worse accuracy. Camera work has a better home at the **swap-event scanner** (Module 8) where it's a narrow, high-value problem: read one printed code on one sticker at a time. See `MASTERCLASS.md` for the full debate.

## User story
Daniel sits on the couch with his son and the open album. The app shows one sticker at a time, in album order. For each:
- Has it → tap **Have** (or swipe right)
- Doesn't have it → tap **Need** (or swipe left)
- Has multiple → tap **Dupe +1** (or swipe up) — records or increments dupe count

The app advances immediately. Progress is visible. If the app closes (interruption, dead battery, son loses interest), reopening resumes at the next undecided sticker. They finish across a weekend in two sittings.

## Done criteria
- Route: `/inventory/first` (or your equivalent — document the choice)
- Shows one sticker at a time, in album-order sequence
- Three primary actions: **Need** / **Have** / **Dupe +1**
- Tap and swipe both work
- Auto-advance after each action
- Progress visible: `47 / 670` (page context optional — see Q3)
- Single-level undo
- Skip action — defers the decision; skipped stickers reappear at the end of the pass
- Every action persists to IndexedDB **synchronously** — if the app dies mid-pass, zero data lost
- Resume on relaunch — opens at the next undecided sticker
- Done state when all 670 stickers have a decision

## Constraints (from CLAUDE.md)
- Tap-to-advance feels instant (<50ms). Each write is one Dexie put on the indexed primary key.
- Local-first, offline-only.
- No new runtime dependencies beyond what's in `package.json`. **Exception:** one swipe library is acceptable if native touch handling proves unreliable across iOS Safari versions. Document the choice if you reach for it.
- Functional React + hooks. Tailwind utilities. Tests colocated.

## Out of scope (explicitly NOT building)
- Photo / camera input — Module 8.
- Sticker images / thumbnails — no `imageUrl` field yet.
- Multi-device sync — Module 9.
- Per-user accounts. Just one shared device.
- Statistics dashboard / completion percentage chart — save for the Inventory Browser feature later.
- Bulk editing of prior decisions — only single undo for v1.
- Filter / search inside this mode — that's the lookup screen, wrong tool here.

If Claude proposes any of the above in its plan, push back.

## Open questions (decide in plan mode, not pre-decided)

**Q1. How do we distinguish "haven't reviewed yet" from "decided this is a need"?**
Both currently map to `owned: 0`. Options:
- (a) Add `reviewed: boolean` field to `Sticker`
- (b) Use `owned: -1` sentinel for "unseen"
- (c) Separate `Decision` table tracking the review pass

Pick one, update CLAUDE.md's data model accordingly, justify the choice in two sentences.

**Q2. Swipe handling — native touch events or a library?**
Try native first. If it takes more than ~30 minutes to get reliable cross-iOS-Safari behavior, fall back to `react-swipeable`. Document the choice in code comments.

**Q3. Page-number context in the UI.**
The user story says `47 / 670 — Page 6`. Page numbers help the human sitting with the physical album. But they require knowing page layout, which Module 3 ingestion may or may not produce. If we don't have page data yet, drop the page context and ship `47 / 670`.

## Suggested first slice
Smallest version worth shipping in one Claude Code session:

1. `/inventory/first` route renders.
2. Reads stickers from Dexie in code order.
3. Shows current sticker; three tap buttons (Need / Have / Dupe); a progress counter.
4. Tap writes to Dexie and advances to next sticker.
5. Resume-on-relaunch works.

That's the spike. Ship it, run it on your phone, see how it actually feels in your hand. Add swipe gestures, undo, skip, and the done state in a second session.

## How to use this spec in Claude Code

In a fresh Claude Code session in this repo:

```
Read @specs/01-first-inventory.md and CLAUDE.md.
Enter plan mode (Shift+Tab if you're not already there).
Propose the smallest slice we can ship.
Stop after the plan — do not write code yet.
```

Review the plan. Push back where it overreaches (e.g., proposes building anything in the "Out of scope" list) or under-reaches (e.g., skips persistence, defers things the spec marks as in-slice-1). When you're happy:

```
Approved. Execute slice 1.
```

Then watch Claude work. Diff-review every edit. When slice 1 is running on your phone, open the next session with:

```
Read @specs/01-first-inventory.md.
Slice 1 is done. Propose slice 2 (swipe + undo + skip + done state).
Plan mode, no code yet.
```

## Decision log
- 2026-05-25 — chose manual entry over photo ingestion. See MASTERCLASS.md for the debate.
- (add subsequent decisions here as the spec evolves)
