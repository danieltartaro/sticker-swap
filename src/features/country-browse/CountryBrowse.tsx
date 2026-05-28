import { useEffect, useMemo, useState } from 'react';
import { db } from '../../data/db';
import type { Sticker } from '../../data/types';
import { JERSEY_PRIMARY, resolveJerseyColor } from '../../data/jerseyColors';
import { COUNTRY_NAMES } from '../../data/countryNames';
import GridCard from '../../components/GridCard';
import CountryPicker from './CountryPicker';
import {
  SPECIALS_CODE,
  computeMissingByCode,
  filterMissingForCountry,
  matchesSpecials,
  sortPickerRows,
  type PickerRow,
} from './countryBrowseLogic';

const COUNTRY_CODES = Object.keys(COUNTRY_NAMES);
const FADE_MS = 220;

function totalsByCode(stickers: Sticker[]): Record<string, number> {
  const totals: Record<string, number> = { [SPECIALS_CODE]: 0 };
  for (const code of COUNTRY_CODES) totals[code] = 0;
  for (const s of stickers) {
    if (matchesSpecials(s)) {
      totals[SPECIALS_CODE] += 1;
      continue;
    }
    const prefix = s.code.match(/^[A-Z]+/)?.[0];
    if (prefix && prefix in totals) totals[prefix] += 1;
  }
  return totals;
}

function CompleteCheck() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="var(--color-fifa-green)"
        strokeWidth="3.5"
      />
      <path
        d="M20 33 L29 42 L45 24"
        fill="none"
        stroke="var(--color-fifa-green)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CountryBrowse() {
  const [stickers, setStickers] = useState<Sticker[] | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(true);
  const [fading, setFading] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    db.stickers
      .orderBy('sortIndex')
      .toArray()
      .then((all) => {
        if (!cancelled) setStickers(all);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const missingByCode = useMemo(
    () => (stickers ? computeMissingByCode(stickers, COUNTRY_CODES) : {}),
    [stickers],
  );
  const totals = useMemo(
    () => (stickers ? totalsByCode(stickers) : {}),
    [stickers],
  );

  const pickerRows: PickerRow[] = useMemo(() => {
    const rows: PickerRow[] = COUNTRY_CODES.map((code) => ({
      code,
      name: COUNTRY_NAMES[code],
      swatchColor: JERSEY_PRIMARY[code],
      missing: missingByCode[code] ?? 0,
      isSpecials: false,
    }));
    rows.push({
      code: SPECIALS_CODE,
      name: 'Specials',
      swatchColor: 'var(--color-fifa-violet)',
      missing: missingByCode[SPECIALS_CODE] ?? 0,
      isSpecials: true,
    });
    return sortPickerRows(rows);
  }, [missingByCode]);

  const shownStickers = useMemo(
    () => (stickers && selectedCode ? filterMissingForCountry(stickers, selectedCode) : []),
    [stickers, selectedCode],
  );

  if (stickers === null) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  async function handleGotIt(code: string) {
    if (fading.has(code)) return;
    setFading((prev) => {
      const next = new Set(prev);
      next.add(code);
      return next;
    });
    await db.stickers.update(code, { owned: 1, reviewed: true });
    setTimeout(() => {
      setStickers((prev) =>
        prev ? prev.map((s) => (s.code === code ? { ...s, owned: 1, reviewed: true } : s)) : prev,
      );
      setFading((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }, FADE_MS);
  }

  const selectedName = selectedCode
    ? selectedCode === SPECIALS_CODE
      ? 'Specials'
      : COUNTRY_NAMES[selectedCode] ?? selectedCode
    : null;
  const selectedTotal = selectedCode ? totals[selectedCode] ?? 0 : 0;
  const selectedMissing = selectedCode ? missingByCode[selectedCode] ?? 0 : 0;
  const isComplete = selectedCode !== null && selectedMissing === 0;

  return (
    <div
      className="relative h-[100dvh] flex flex-col"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >
      <header
        className="px-4 py-3 text-center flex-shrink-0"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="font-sans text-lg underline min-h-[44px] px-2"
          style={{ color: 'var(--color-fifa-yellow)' }}
        >
          {selectedName ?? 'Country Selector'}
        </button>
        {selectedCode && (
          <div className="font-sans text-[10px] tracking-widest uppercase text-text-muted mt-1">
            {isComplete
              ? `${selectedName} — complete`
              : `${selectedMissing} / ${selectedTotal} missing`}
          </div>
        )}
      </header>
      <main className="flex-1 overflow-y-auto px-4 min-h-0">
        {selectedCode === null ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="font-sans text-text-muted text-sm max-w-xs">
              Tap Country Selector to pick a country.
            </div>
          </div>
        ) : isComplete ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 pb-12">
            <CompleteCheck />
            <div className="font-sans text-lg text-text-primary">
              {selectedName} complete
            </div>
            <div className="font-sans text-text-muted text-sm max-w-xs">
              All {selectedTotal} stickers in your album. Pick another country.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-2 pb-4">
            {shownStickers.map((s) => (
              <GridCard
                key={s.code}
                code={s.code}
                name={s.name}
                type={s.type}
                teamColor={
                  selectedCode === SPECIALS_CODE ? undefined : resolveJerseyColor(s)
                }
                fading={fading.has(s.code)}
                onGotIt={() => handleGotIt(s.code)}
              />
            ))}
          </div>
        )}
      </main>
      <CountryPicker
        open={pickerOpen}
        rows={pickerRows}
        onSelect={(code) => {
          setSelectedCode(code);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
