import { useEffect, useMemo, useState } from 'react';
import { db } from '../../data/db';
import type { Sticker } from '../../data/types';
import { resolveJerseyColor } from '../../data/jerseyColors';
import { useViewStore } from '../../store/view';
import ScreenLayout from '../../components/ScreenLayout';
import Card from '../../components/Card';
import ActionButton from '../../components/ActionButton';

type Decision = 'need' | 'have' | 'dupe';

export function FirstInventory() {
  const [stickers, setStickers] = useState<Sticker[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const setView = useViewStore((s) => s.setView);

  useEffect(() => {
    let cancelled = false;
    db.stickers
      .orderBy('sortIndex')
      .toArray()
      .then((all) => {
        if (cancelled) return;
        setStickers(all);
        const resume = all.findIndex((s) => !s.reviewed);
        setCurrentIndex(resume === -1 ? all.length : resume);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reviewedCount = useMemo(
    () => (stickers ?? []).filter((s) => s.reviewed).length,
    [stickers],
  );

  if (stickers === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  const total = stickers.length;
  const done = currentIndex >= total;

  if (done) {
    return (
      <ScreenLayout
        counter={
          <>
            <div className="font-mono text-2xl tabular-nums">All done</div>
            <div className="font-sans text-[8px] tracking-widest uppercase text-text-muted mt-1">
              {reviewedCount} / {total} reviewed
            </div>
          </>
        }
        card={null}
        actions={
          <ActionButton
            intent="have"
            label="Start swapping"
            onClick={() => setView('lookup')}
          />
        }
      />
    );
  }

  const current = stickers[currentIndex];

  async function handleAction(decision: Decision) {
    if (busy) return;
    setBusy(true);

    let patch: { owned: number; reviewed: true };
    if (decision === 'need') patch = { owned: 0, reviewed: true };
    else if (decision === 'have') patch = { owned: 1, reviewed: true };
    else patch = { owned: Math.max(current.owned, 1) + 1, reviewed: true };

    await db.stickers.update(current.code, patch);

    setStickers((prev) => {
      if (!prev) return prev;
      const next = prev.slice();
      next[currentIndex] = { ...next[currentIndex], ...patch };
      return next;
    });
    setCurrentIndex((i) => i + 1);
    setBusy(false);
  }

  return (
    <ScreenLayout
      counter={
        <>
          <div className="font-mono text-2xl tabular-nums">
            {reviewedCount} <span className="text-text-dim">/ {total}</span>
          </div>
          <div className="font-sans text-[8px] tracking-widest uppercase text-text-muted mt-1">
            First inventory pass
          </div>
        </>
      }
      card={
        <Card
          code={current.code}
          name={current.name}
          type={current.type}
          teamColor={resolveJerseyColor(current)}
          isShiny={current.isShiny}
        />
      }
      actions={
        <div className="grid grid-cols-3 gap-3">
          <ActionButton
            intent="need"
            label="Need"
            onClick={() => handleAction('need')}
            disabled={busy}
          />
          <ActionButton
            intent="have"
            label="Have"
            onClick={() => handleAction('have')}
            disabled={busy}
          />
          <ActionButton
            intent="dupe"
            label="Dupe +1"
            onClick={() => handleAction('dupe')}
            disabled={busy}
          />
        </div>
      }
    />
  );
}
