import type { Sticker, StickerType } from '../../data/types';

export const SPECIALS_CODE = 'SPE';

// Specials = the FWC* tournament-wide stickers only. `type: 'group'` (team photos
// like BRA13, MEX13, etc.) stay under their respective country — per Lock 9
// post-smoke amendment (2026-05-28).
const SPECIALS_TYPES: ReadonlySet<StickerType> = new Set(['special', 'legend']);

export function matchesSpecials(sticker: Pick<Sticker, 'type'>): boolean {
  return SPECIALS_TYPES.has(sticker.type);
}

export function filterMissingForCountry(
  stickers: Sticker[],
  selectedCode: string,
): Sticker[] {
  if (selectedCode === SPECIALS_CODE) {
    return stickers.filter((s) => matchesSpecials(s) && s.owned === 0);
  }
  return stickers.filter(
    (s) =>
      s.code.startsWith(selectedCode) &&
      s.owned === 0 &&
      !matchesSpecials(s),
  );
}

export function computeMissingByCode(
  stickers: Sticker[],
  countryCodes: string[],
): Record<string, number> {
  const counts: Record<string, number> = { [SPECIALS_CODE]: 0 };
  for (const code of countryCodes) counts[code] = 0;
  for (const s of stickers) {
    if (s.owned !== 0) continue;
    if (matchesSpecials(s)) {
      counts[SPECIALS_CODE] += 1;
      continue;
    }
    const prefix = s.code.match(/^[A-Z]+/)?.[0];
    if (prefix && prefix in counts) counts[prefix] += 1;
  }
  return counts;
}

export type PickerRow = {
  code: string;
  name: string;
  swatchColor: string;
  missing: number;
  isSpecials: boolean;
};

export function sortPickerRows(rows: PickerRow[]): PickerRow[] {
  return [...rows].sort((a, b) => {
    const aComplete = a.missing === 0;
    const bComplete = b.missing === 0;
    if (aComplete !== bComplete) return aComplete ? 1 : -1;
    // Specials pinned to the top of the incomplete bucket — it's a meta
    // category that should always be glanceable first. Within the complete
    // bucket it sorts alphabetically with everything else.
    if (!aComplete && a.isSpecials !== b.isSpecials) return a.isSpecials ? -1 : 1;
    if (a.missing !== b.missing) return b.missing - a.missing;
    return a.name.localeCompare(b.name);
  });
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

// Sum of per-channel absolute RGB diffs. Below threshold → swatch and bg
// are close enough that the swatch needs a 1px border to read.
export function isNearBg(
  hex: string,
  bgHex: string = '#1E293B',
  threshold: number = 60,
): boolean {
  const a = parseHex(hex);
  const b = parseHex(bgHex);
  if (!a || !b) return false;
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) < threshold;
}
