import { useEffect, useState } from 'react';
import { db } from '../../data/db';
import { useViewStore } from '../../store/view';

export function Welcome() {
  const [count, setCount] = useState<number | null>(null);
  const setView = useViewStore((s) => s.setView);

  useEffect(() => {
    let cancelled = false;
    db.stickers.count().then((n) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

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
          {count}
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
          onClick={() => setView('first-inventory')}
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
