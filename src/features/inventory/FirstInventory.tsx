import { useEffect, useState } from 'react';
import { db, resetInventory } from '../../data/db';
import type { Sticker } from '../../data/types';
import { resolveJerseyColor } from '../../data/jerseyColors';
import { useViewStore } from '../../store/view';
import { TYPE_STYLES } from '../../components/TypePill';
import ConfirmDialog from '../../components/ConfirmDialog';
import { nextStateOnDecision, arrowVisibility } from './inventoryNavigation';

type Decision = 'need' | 'have';

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

export function FirstInventory() {
  const [stickers, setStickers] = useState<Sticker[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const setView = useViewStore((s) => s.setView);

  useEffect(() => {
    let cancelled = false;
    db.stickers
      .orderBy('sortIndex')
      .toArray()
      .then((all) => {
        if (cancelled) return;
        setStickers(all);
        const resumeIdx = all.findIndex((s) => !s.reviewed);
        const resolved = resumeIdx === -1 ? all.length : resumeIdx;
        setCurrentIndex(resolved);
        setFurthestIndex(resolved);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (stickers === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  const total = stickers.length;
  const done = currentIndex >= total;
  const { showLeft, showRight } = arrowVisibility(currentIndex, furthestIndex);

  async function handleReset() {
    await resetInventory();
    setConfirmOpen(false);
    setView('welcome');
  }

  const dialog = (
    <ConfirmDialog
      open={confirmOpen}
      title="Reset inventory?"
      body="This wipes every decision and restarts the first inventory pass. This cannot be undone."
      cancelLabel="Cancel"
      confirmLabel="Reset"
      onCancel={() => setConfirmOpen(false)}
      onConfirm={handleReset}
    />
  );

  if (done) {
    return (
      <div className="relative">
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
              {total} / {total} reviewed
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={busy}
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

          <main className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
            <div className="w-full max-w-[280px] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={busy}
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
              onClick={() => setView('country-browse')}
              disabled={busy}
              className="w-full h-14 text-white rounded-2xl text-[18px] font-medium"
              style={{ background: 'var(--color-fifa-green)' }}
            >
              Start swapping
            </button>
          </footer>
        </div>
        {dialog}
      </div>
    );
  }

  const current = stickers[currentIndex];
  const teamColor = resolveJerseyColor(current);
  const typeStyle = TYPE_STYLES[current.type];

  async function handleAction(decision: Decision) {
    if (busy) return;
    setBusy(true);

    const patch: { owned: number; reviewed: true } =
      decision === 'need'
        ? { owned: 0, reviewed: true }
        : { owned: 1, reviewed: true };

    await db.stickers.update(current.code, patch);

    setStickers((prev) => {
      if (!prev) return prev;
      const next = prev.slice();
      next[currentIndex] = { ...next[currentIndex], ...patch };
      return next;
    });
    const next = nextStateOnDecision(currentIndex, furthestIndex);
    setCurrentIndex(next.currentIndex);
    setFurthestIndex(next.furthestIndex);
    setBusy(false);
  }

  return (
    <div className="relative">
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
            {currentIndex + 1}{' '}
            <span className="text-text-dim">/ {total}</span>
          </div>
          <div className="mt-1.5 text-[9px] tracking-[0.16em] uppercase text-text-muted">
            First inventory pass
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
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

        <main className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
          <div
            className="w-full max-w-[280px] min-h-[280px] rounded-[18px] flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'var(--color-bg-card)' }}
          >
            {teamColor && (
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ background: teamColor }}
              />
            )}
            <div className="font-mono text-[44px] leading-none font-medium tracking-[0.04em] text-text-primary mt-1.5">
              {current.code}
            </div>
            {current.name && (
              <div className="mt-3 text-[13px] text-text-muted">
                {current.name}
              </div>
            )}
            <div
              className="mt-3 text-[9px] tracking-[0.16em] uppercase border rounded-md px-2.5 py-1"
              style={{
                borderColor: typeStyle.border,
                color: typeStyle.text,
              }}
            >
              {current.type}
            </div>
          </div>

          <div className="mt-4 w-full max-w-[280px] flex items-center justify-between">
            {showLeft ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={busy}
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
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={busy}
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

        <footer
          className="flex-shrink-0 px-4 pt-2 grid grid-cols-2 gap-3"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
        >
          <button
            type="button"
            onClick={() => handleAction('need')}
            disabled={busy}
            className="h-14 text-white rounded-2xl text-[18px] font-medium"
            style={{ background: 'var(--color-fifa-violet)' }}
          >
            Need
          </button>
          <button
            type="button"
            onClick={() => handleAction('have')}
            disabled={busy}
            className="h-14 text-white rounded-2xl text-[18px] font-medium"
            style={{ background: 'var(--color-fifa-green)' }}
          >
            Have
          </button>
        </footer>
      </div>
      {dialog}
    </div>
  );
}
