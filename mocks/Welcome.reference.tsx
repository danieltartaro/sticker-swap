/**
 * VISUAL SOURCE OF TRUTH — Welcome screen.
 *
 * Reference file. NOT imported by production code. Not scanned by Tailwind.
 * Its only job is to be copy-pasted into src/features/inventory/Welcome.tsx,
 * preserving every Tailwind class, every inline style, every piece of copy,
 * every spacing value.
 *
 * Rules for the implementer (human or Claude Code):
 *   1. Copy the JSX tree exactly. Do not "improve" class names, do not
 *      substitute "equivalent" Tailwind utilities, do not collapse styles.
 *   2. Replace the hardcoded `count` value (980) with a real Dexie read,
 *      preserving the wrapping div's classes.
 *   3. Wire the button onClick to setView('first-inventory').
 *   4. Preserve the eyebrow copy "FWC 2026 Sticker Swap" exactly, case and
 *      tracking. Preserve the body copy "stickers to find. Let's go through
 *      them one by one and mark what you already have." exactly.
 *   5. Preserve the footnote "Takes ~20 minutes for a sealed album" exactly.
 *   6. If you think something here is wrong, FLAG IT — do not silently
 *      change it. The mock PNG (mocks/07-welcome.png) is the visual lock
 *      this file implements; reach back to Daniel before any deviation.
 *
 * If you find drift between this file and the production Welcome.tsx, the
 * reference wins. Patch production to match.
 */

// Hardcoded sample value. Replace with `useStickerCount()` or similar in
// the production component while preserving the wrapping classes.
const SAMPLE_COUNT = 980;

export default function WelcomeReference() {
  return (
    <div
      style={{
        background: 'var(--color-bg-app)',
        color: 'var(--color-text-primary)',
      }}
      className="h-[100dvh] flex flex-col items-center justify-between px-6 pt-14 pb-8"
    >
      {/* Top spacer — keeps the center block from drifting up on tall screens */}
      <div className="flex-shrink-0" />

      {/* Middle: eyebrow + hero digit + body */}
      <div className="text-center flex flex-col gap-5 items-center">
        <div className="text-[11px] tracking-[0.18em] uppercase text-text-muted">
          FWC 2026 Sticker Swap
        </div>
        <div className="font-mono text-[48px] leading-none font-medium tabular-nums">
          {SAMPLE_COUNT}
        </div>
        <div className="text-[13px] text-text-muted leading-relaxed max-w-[240px] mx-auto">
          stickers to find. Let&apos;s go through them one by one and mark what
          you already have.
        </div>
      </div>

      {/* Bottom: CTA + footnote */}
      <div className="w-full flex flex-col gap-3">
        <button
          type="button"
          className="w-full h-14 text-white rounded-2xl text-lg font-medium tracking-[0.02em]"
          style={{ background: 'var(--color-fifa-green)' }}
          onClick={() => {
            // In production, replace with: useViewStore.getState().setView('first-inventory')
          }}
        >
          Start first inventory pass
        </button>
        <div className="text-center text-[11px] text-text-dim">
          Takes ~20 minutes for a sealed album
        </div>
      </div>
    </div>
  );
}
