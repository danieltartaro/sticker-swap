/**
 * VISUAL SOURCE OF TRUTH — FirstInventory screen, active state.
 *
 * Reference file. NOT imported by production. Not scanned by Tailwind.
 * Copy the JSX exactly into src/features/inventory/FirstInventory.tsx,
 * preserving classes, inline styles, copy, and structure.
 *
 * Three states covered below:
 *   A. Active state (counter + Reset link + card + arrow row + Need/Have)
 *   B. Done state (counter "All done" + left-arrow only + Start swapping)
 *   C. Reset confirm dialog
 *
 * Rules for the implementer (human or Claude Code):
 *   1. Copy each JSX tree exactly. Same Tailwind classes, same inline
 *      styles, same SVG paths.
 *   2. The Card body has NO BORDER. Only the green stripe at top. Do not
 *      add ring-* or border-* utilities.
 *   3. Need/Have buttons are `rounded-2xl`, full-color fills, white text on
 *      violet, white text on green. No outline. No internal border.
 *   4. Arrows are 32×32 chunky filled triangles inside ≥44×44 tap targets.
 *      Use the SVG path verbatim. Color via `style={{ fill:
 *      'var(--color-fifa-yellow)' }}` on the SVG, not via currentColor.
 *   5. Reset link is fifa-yellow, underlined, text-[15px], directly below
 *      the FIRST INVENTORY PASS eyebrow.
 *   6. ARROW POSITIONING (corrected 2026-05-28 after iPhone smoke):
 *      Arrows live in the MAIN slot, directly BELOW the card, with a small
 *      gap (`mt-4`). They are visually grouped WITH THE CARD, not with the
 *      Need/Have buttons. The big vertical gap is between the arrow row
 *      and the Need/Have row, NOT between the card and the arrows.
 *      Arrow row width is constrained to match the card width
 *      (`w-full max-w-[280px]`) so left/right arrows align with the card's
 *      left/right edges via `justify-between`.
 *   7. The arrow row uses `justify-between` so left sits at the card's
 *      left edge and right at the card's right edge. When right is hidden,
 *      left stays at left edge (render an empty 44×44 spacer on the right
 *      side — do not re-center).
 *   8. If you think something here is wrong, FLAG IT — do not silently
 *      change it. The mock PNGs in this folder (07-first-inventory-*.png)
 *      and Daniel's iPhone screenshots are the visual lock this file
 *      implements.
 */

import { useState } from 'react';

// ----- Shared atoms -----------------------------------------------------------

function ArrowLeftIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      style={{ fill: 'var(--color-fifa-yellow)' }}
      aria-hidden
    >
      <path d="M22 4 L6 16 L22 28 Z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      style={{ fill: 'var(--color-fifa-yellow)' }}
      aria-hidden
    >
      <path d="M10 4 L26 16 L10 28 Z" />
    </svg>
  );
}

// ----- State A: Active --------------------------------------------------------

/**
 * Active state. User is viewing sticker at currentIndex, can decide or rewind.
 * Right arrow visible only when currentIndex < furthestIndex.
 * Left arrow visible only when currentIndex > 0.
 */
export function FirstInventoryActiveReference() {
  const SAMPLE = {
    currentIndex: 3, // 0-indexed → counter shows "4 / 980"
    total: 980,
    furthestIndex: 5, // user has rewound from 5; both arrows visible
    sticker: {
      code: 'MEX1',
      name: 'Emblem',
      type: 'badge' as const,
      teamColor: '#006847', // Mexico green
    },
  };

  const showLeft = SAMPLE.currentIndex > 0;
  const showRight = SAMPLE.currentIndex < SAMPLE.furthestIndex;

  return (
    <div
      style={{
        background: 'var(--color-bg-app)',
        color: 'var(--color-text-primary)',
      }}
      className="h-[100dvh] flex flex-col"
    >
      {/* Counter slot */}
      <header
        className="px-4 pt-3 text-center flex-shrink-0"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        <div className="font-mono text-[22px] leading-none font-medium tabular-nums">
          {SAMPLE.currentIndex + 1}{' '}
          <span className="text-text-dim">/ {SAMPLE.total}</span>
        </div>
        <div className="mt-1.5 text-[9px] tracking-[0.16em] uppercase text-text-muted">
          First inventory pass
        </div>
        <button
          type="button"
          className="mt-1.5 text-[15px] underline underline-offset-[4px]"
          style={{
            color: 'var(--color-fifa-yellow)',
            background: 'none',
            border: 'none',
            padding: '4px',
          }}
        >
          Reset inventory
        </button>
      </header>

      {/*
        Card slot.
        Contains BOTH the Card and the arrow row, stacked vertically with a
        small gap. The whole [Card + arrow row] group is centered in the
        flex-1 main, which is what produces the desired layout: small gap
        between card and arrows, big gap between arrows and Need/Have.
      */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <div
          className="w-full max-w-[280px] min-h-[280px] rounded-[18px] flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: 'var(--color-bg-card)' }}
        >
          {/* Team stripe — green Mexico jersey */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: SAMPLE.sticker.teamColor }}
          />
          <div className="font-mono text-[44px] leading-none font-medium tracking-[0.04em] text-text-primary mt-1.5">
            {SAMPLE.sticker.code}
          </div>
          <div className="mt-3 text-[13px] text-text-muted">
            {SAMPLE.sticker.name}
          </div>
          <div
            className="mt-3 text-[9px] tracking-[0.16em] uppercase border rounded-md px-2.5 py-1"
            style={{
              borderColor: 'var(--type-badge-border)',
              color: 'var(--type-badge-text)',
            }}
          >
            {SAMPLE.sticker.type}
          </div>
        </div>

        {/*
          Arrow row, directly below the card, width-matched to card.
          mt-4 is the small gap between card and arrows. The big gap below
          the arrows is the remaining vertical space in flex-1 main.
        */}
        <div className="mt-4 w-full max-w-[280px] flex items-center justify-between">
          {showLeft ? (
            <button
              type="button"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ background: 'none', border: 'none' }}
              aria-label="Previous sticker"
            >
              <ArrowLeftIcon />
            </button>
          ) : (
            <div className="min-w-[44px] min-h-[44px]" />
          )}
          {showRight ? (
            <button
              type="button"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ background: 'none', border: 'none' }}
              aria-label="Next sticker"
            >
              <ArrowRightIcon />
            </button>
          ) : (
            <div className="min-w-[44px] min-h-[44px]" />
          )}
        </div>
      </main>

      {/* Need / Have row — flush at bottom, separated from arrows by the big gap above */}
      <footer
        className="flex-shrink-0 px-4 pt-2 grid grid-cols-2 gap-3"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <button
          type="button"
          className="h-14 text-white rounded-2xl text-[18px] font-medium"
          style={{ background: 'var(--color-fifa-violet)' }}
        >
          Need
        </button>
        <button
          type="button"
          className="h-14 text-white rounded-2xl text-[18px] font-medium"
          style={{ background: 'var(--color-fifa-green)' }}
        >
          Have
        </button>
      </footer>
    </div>
  );
}

// ----- State B: Done ----------------------------------------------------------

/**
 * Done state. currentIndex >= total. Left arrow available to rewind back into
 * the deck (right arrow is naturally hidden because current === furthest).
 * The "Start swapping" CTA routes to Country Browse in slice 3.
 */
export function FirstInventoryDoneReference() {
  const SAMPLE = { total: 980, reviewed: 980 };

  return (
    <div
      style={{
        background: 'var(--color-bg-app)',
        color: 'var(--color-text-primary)',
      }}
      className="h-[100dvh] flex flex-col"
    >
      <header
        className="px-4 pt-3 text-center flex-shrink-0"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        <div className="font-mono text-[22px] leading-none font-medium tabular-nums">
          All done
        </div>
        <div className="mt-1.5 text-[9px] tracking-[0.16em] uppercase text-text-muted">
          {SAMPLE.reviewed} / {SAMPLE.total} reviewed
        </div>
        <button
          type="button"
          className="mt-1.5 text-[15px] underline underline-offset-[4px]"
          style={{
            color: 'var(--color-fifa-yellow)',
            background: 'none',
            border: 'none',
            padding: '4px',
          }}
        >
          Reset inventory
        </button>
      </header>

      {/*
        Main slot. No card in done state. The left arrow lives here, where
        the card would otherwise sit — same vertical band as the arrows in
        the active state. This keeps the rewind affordance in a consistent
        location across states.
      */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <div className="w-full max-w-[280px] flex items-center justify-between">
          <button
            type="button"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ background: 'none', border: 'none' }}
            aria-label="Previous sticker"
          >
            <ArrowLeftIcon />
          </button>
          <div className="min-w-[44px] min-h-[44px]" />
        </div>
      </main>

      <footer
        className="flex-shrink-0 px-4 pt-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <button
          type="button"
          className="w-full h-14 text-white rounded-2xl text-[18px] font-medium"
          style={{ background: 'var(--color-fifa-green)' }}
        >
          Start swapping
        </button>
      </footer>
    </div>
  );
}

// ----- State C: Reset confirm dialog ------------------------------------------

/**
 * Reset confirm dialog. Backdrop dims the screen; card centers vertically.
 * Cancel = outlined gray. Confirm = fifa-red (destructive intent).
 */
export function ResetConfirmDialogReference() {
  const [open] = useState(true);
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        className="w-full rounded-2xl px-5 py-6 text-center flex flex-col gap-4"
        style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
      >
        <div className="text-[17px] font-medium">Reset inventory?</div>
        <div className="text-[13px] leading-relaxed text-text-muted">
          This wipes every decision and starts over from sticker 1. You can&apos;t
          undo this.
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            className="h-12 rounded-xl text-[15px] font-medium border"
            style={{
              background: 'transparent',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-text-dim)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-12 rounded-xl text-[15px] font-medium text-white"
            style={{ background: 'var(--color-fifa-red)' }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
