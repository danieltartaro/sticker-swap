import { useEffect, useState } from 'react';
import { db } from '../../data/db';
import { useViewStore } from '../../store/view';
import { isStandalone } from '../../lib/isStandalone';

export function Welcome() {
  const [count, setCount] = useState<number | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [standalone, setStandalone] = useState(true); // start true to avoid flash
  const setView = useViewStore((s) => s.setView);

  useEffect(() => {
    let cancelled = false;
    db.stickers.count().then((n) => {
      if (!cancelled) setCount(n);
    });
    setStandalone(isStandalone());
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
      className="h-[100dvh] flex flex-col items-center justify-between px-6 pt-14 pb-8 relative"
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

      {/* Bottom: (optional) install link → primary CTA → footnote */}
      <div className="w-full flex flex-col gap-3">
        {!standalone && (
          <button
            type="button"
            onClick={() => setInstallOpen(true)}
            className="text-center text-[13px] underline mb-1"
            style={{ color: 'var(--color-fifa-yellow)' }}
          >
            Save to home screen first
          </button>
        )}
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

      <InstallInstructions
        open={installOpen}
        onClose={() => setInstallOpen(false)}
      />
    </div>
  );
}

type InstallInstructionsProps = {
  open: boolean;
  onClose: () => void;
};

function InstallInstructions({ open, onClose }: InstallInstructionsProps) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        className="w-full rounded-2xl px-5 py-6 flex flex-col gap-5 max-h-[85dvh] overflow-y-auto"
        style={{
          background: 'var(--color-bg-card)',
          color: 'var(--color-text-primary)',
          maxWidth: '360px',
        }}
      >
        <div className="text-[17px] font-medium text-center">
          Save to home screen
        </div>

        <div className="text-[12px] leading-relaxed text-text-muted text-center">
          Adds an app icon so you can open Sticker Swap full-screen and offline at
          the swap event.
        </div>

        <section className="flex flex-col gap-2">
          <div className="text-[11px] tracking-[0.18em] uppercase text-text-muted">
            iPhone
          </div>
          <div
            className="text-[12px] leading-relaxed px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(255, 214, 0, 0.08)',
              color: 'var(--color-fifa-yellow)',
            }}
          >
            Open this page in <strong>Safari</strong>. Chrome on iPhone can&apos;t
            install web apps.
          </div>
          <ol className="text-[13px] leading-relaxed text-text-primary list-decimal pl-5 flex flex-col gap-1">
            <li>Tap the Share button at the bottom of the screen.</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong> in the top-right.</li>
            <li>Open the new icon from your home screen.</li>
          </ol>
        </section>

        <section className="flex flex-col gap-2">
          <div className="text-[11px] tracking-[0.18em] uppercase text-text-muted">
            Android
          </div>
          <ol className="text-[13px] leading-relaxed text-text-primary list-decimal pl-5 flex flex-col gap-1">
            <li>Tap the three-dot menu in Chrome&apos;s top-right.</li>
            <li>Tap <strong>Install app</strong> (or <strong>Add to Home Screen</strong>).</li>
            <li>Confirm. The icon lands in your app drawer.</li>
          </ol>
        </section>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 rounded-xl text-[15px] font-medium text-white mt-2"
          style={{ background: 'var(--color-fifa-green)' }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
