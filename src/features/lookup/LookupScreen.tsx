import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../../data/db';
import type { Sticker } from '../../data/types';
import { resolveJerseyColor } from '../../data/jerseyColors';
import {
  deriveLookupState,
  nextOwned,
  type LookupAction,
  type LookupState,
} from './lookupLogic';
import ScreenLayout from '../../components/ScreenLayout';
import Card from '../../components/Card';
import ActionButton, { INTENT_BG } from '../../components/ActionButton';

const STATE_PILL_BG: Record<LookupState, string> = {
  need: INTENT_BG.need,
  have: INTENT_BG.have,
  dupe: INTENT_BG.dupe,
};

export function LookupScreen() {
  const [stickers, setStickers] = useState<Sticker[] | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    db.stickers
      .orderBy('sortIndex')
      .toArray()
      .then((all) => {
        if (cancelled) return;
        setStickers(all);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lookupMap = useMemo(() => {
    if (!stickers) return null;
    return new Map(stickers.map((s) => [s.code.toUpperCase(), s]));
  }, [stickers]);

  if (stickers === null || lookupMap === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  const trimmed = input.trim();
  const match = trimmed ? lookupMap.get(trimmed.toUpperCase()) ?? null : null;

  async function applyAction(sticker: Sticker, action: LookupAction) {
    if (busy) return;
    setBusy(true);
    const next = nextOwned(sticker.owned, action);
    await db.stickers.update(sticker.code, { owned: next });
    setStickers((prev) => {
      if (!prev) return prev;
      return prev.map((s) => (s.code === sticker.code ? { ...s, owned: next } : s));
    });
    setInput('');
    setBusy(false);
    inputRef.current?.focus();
  }

  const state = match ? deriveLookupState(match.owned) : null;

  return (
    <ScreenLayout
      counter={
        <input
          ref={inputRef}
          type="text"
          autoFocus
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a sticker code"
          className="w-full min-h-[56px] bg-slate-800 text-slate-50 placeholder:text-slate-500 text-2xl font-mono tracking-wider text-center rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
        />
      }
      card={
        trimmed === '' ? null : match === null ? (
          <div className="text-text-muted text-center">
            No sticker found for {trimmed}
          </div>
        ) : (
          <div className="w-full max-w-sm flex flex-col gap-3">
            <Card
              code={match.code}
              name={match.name}
              type={match.type}
              teamColor={resolveJerseyColor(match)}
              isShiny={match.isShiny}
            />
            <StatePill state={state!} owned={match.owned} />
          </div>
        )
      }
      actions={
        match === null || state === null ? null : state === 'need' ? (
          <ActionButton
            intent="have"
            label="Now I have it"
            onClick={() => applyAction(match, 'now-have')}
            disabled={busy}
          />
        ) : state === 'have' ? (
          <ActionButton
            intent="dupe"
            label="Got a dupe"
            onClick={() => applyAction(match, 'got-dupe')}
            disabled={busy}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              intent="dupe"
              label="Got another"
              onClick={() => applyAction(match, 'got-another')}
              disabled={busy}
            />
            <ActionButton
              intent="subtract"
              label="Gave one away"
              onClick={() => applyAction(match, 'gave-away')}
              disabled={busy}
            />
          </div>
        )
      }
    />
  );
}

function StatePill({ state, owned }: { state: LookupState; owned: number }) {
  const label =
    state === 'need' ? 'NEED' : state === 'have' ? 'HAVE' : `DUPE +${owned - 1}`;
  return (
    <div
      style={{ background: STATE_PILL_BG[state] }}
      className="rounded-md px-4 py-2 text-center text-white text-xl font-bold tracking-wider"
    >
      {label}
    </div>
  );
}
