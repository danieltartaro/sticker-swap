import { describe, it, expect } from 'vitest';
import type { Sticker } from '../../data/types';
import {
  SPECIALS_CODE,
  matchesSpecials,
  filterMissingForCountry,
  computeMissingByCode,
  sortPickerRows,
  isNearBg,
  type PickerRow,
} from './countryBrowseLogic';

function s(partial: Partial<Sticker> & { code: string; type: Sticker['type'] }): Sticker {
  return {
    owned: 0,
    reviewed: true,
    sortIndex: 0,
    ...partial,
  };
}

const SAMPLE: Sticker[] = [
  s({ code: 'BRA1',  type: 'badge',   owned: 0 }),
  s({ code: 'BRA3',  type: 'player',  owned: 0 }),
  s({ code: 'BRA8',  type: 'player',  owned: 1 }),
  s({ code: 'BRA13', type: 'group',   owned: 0 }), // team photo — stays under Brazil, NOT Specials
  s({ code: 'MEX1',  type: 'badge',   owned: 0 }),
  s({ code: 'MEX5',  type: 'player',  owned: 1 }),
  s({ code: 'FWC1',  type: 'special', owned: 0 }),
  s({ code: 'FWC15', type: 'legend',  owned: 0 }),
  s({ code: '00',    type: 'special', owned: 1 }),
];

describe('matchesSpecials', () => {
  it('returns true for special and legend', () => {
    expect(matchesSpecials({ type: 'special' })).toBe(true);
    expect(matchesSpecials({ type: 'legend' })).toBe(true);
  });
  it('returns false for player, badge, and group (group = team photo, belongs to country)', () => {
    expect(matchesSpecials({ type: 'player' })).toBe(false);
    expect(matchesSpecials({ type: 'badge' })).toBe(false);
    expect(matchesSpecials({ type: 'group' })).toBe(false);
  });
});

describe('filterMissingForCountry', () => {
  it('returns BRA-prefix non-specials with owned=0 (including the BRA13 team photo)', () => {
    const out = filterMissingForCountry(SAMPLE, 'BRA');
    expect(out.map((x) => x.code)).toEqual(['BRA1', 'BRA3', 'BRA13']);
  });
  it('includes BRA13 (group type / team photo) under Brazil', () => {
    const out = filterMissingForCountry(SAMPLE, 'BRA');
    expect(out.find((x) => x.code === 'BRA13')).toBeDefined();
  });
  it('returns FWC specials (special|legend) with owned=0 for SPE — no group stickers', () => {
    const out = filterMissingForCountry(SAMPLE, SPECIALS_CODE);
    expect(out.map((x) => x.code).sort()).toEqual(['FWC1', 'FWC15']);
  });
  it('excludes owned>0 stickers', () => {
    const out = filterMissingForCountry(SAMPLE, 'MEX');
    expect(out.map((x) => x.code)).toEqual(['MEX1']);
  });
  it('returns empty for an unknown country code', () => {
    expect(filterMissingForCountry(SAMPLE, 'ZZZ')).toEqual([]);
  });
});

describe('computeMissingByCode', () => {
  it('counts only owned=0 stickers per prefix; SPE aggregates special + legend (not group)', () => {
    const counts = computeMissingByCode(SAMPLE, ['BRA', 'MEX']);
    expect(counts).toEqual({ BRA: 3, MEX: 1, [SPECIALS_CODE]: 2 });
  });
  it('returns 0 for a known prefix with no missing stickers', () => {
    const allOwned = SAMPLE.map((x) => ({ ...x, owned: 1 }));
    const counts = computeMissingByCode(allOwned, ['BRA', 'MEX']);
    expect(counts.BRA).toBe(0);
    expect(counts.MEX).toBe(0);
    expect(counts[SPECIALS_CODE]).toBe(0);
  });
  it('seeds 0 for prefixes with no stickers at all', () => {
    const counts = computeMissingByCode(SAMPLE, ['BRA', 'XYZ']);
    expect(counts.XYZ).toBe(0);
  });
});

describe('sortPickerRows', () => {
  const row = (partial: Partial<PickerRow> & { code: string; missing: number; name: string }): PickerRow => ({
    swatchColor: '#000000',
    isSpecials: false,
    ...partial,
  });

  it('puts most-missing first', () => {
    const out = sortPickerRows([
      row({ code: 'A', name: 'A', missing: 1 }),
      row({ code: 'B', name: 'B', missing: 5 }),
      row({ code: 'C', name: 'C', missing: 3 }),
    ]);
    expect(out.map((r) => r.code)).toEqual(['B', 'C', 'A']);
  });

  it('tie-breaks alphabetically by name', () => {
    const out = sortPickerRows([
      row({ code: 'C', name: 'Charlie', missing: 2 }),
      row({ code: 'A', name: 'Alpha',   missing: 2 }),
      row({ code: 'B', name: 'Bravo',   missing: 2 }),
    ]);
    expect(out.map((r) => r.code)).toEqual(['A', 'B', 'C']);
  });

  it('clamps completed countries to the bottom regardless of name', () => {
    const out = sortPickerRows([
      row({ code: 'A', name: 'Alpha', missing: 0 }),
      row({ code: 'Z', name: 'Zulu',  missing: 3 }),
      row({ code: 'B', name: 'Bravo', missing: 0 }),
    ]);
    expect(out.map((r) => r.code)).toEqual(['Z', 'A', 'B']);
  });

  it('pins SPE to the top of the incomplete bucket, regardless of missing count', () => {
    const out = sortPickerRows([
      row({ code: 'BRA', name: 'Brazil',   missing: 20 }),
      row({ code: 'SPE', name: 'Specials', missing: 1, isSpecials: true }),
      row({ code: 'MEX', name: 'Mexico',   missing: 20 }),
    ]);
    expect(out.map((r) => r.code)).toEqual(['SPE', 'BRA', 'MEX']);
  });

  it('pins SPE ahead of an alphabetically-first country when both are incomplete and tied on missing', () => {
    const out = sortPickerRows([
      row({ code: 'ARG', name: 'Argentina', missing: 20 }),
      row({ code: 'ALG', name: 'Algeria',   missing: 20 }),
      row({ code: 'SPE', name: 'Specials',  missing: 20, isSpecials: true }),
    ]);
    expect(out.map((r) => r.code)).toEqual(['SPE', 'ALG', 'ARG']);
  });

  it('does NOT pin SPE to the top when it is complete — falls into the alphabetical bottom bucket', () => {
    const out = sortPickerRows([
      row({ code: 'ARG', name: 'Argentina', missing: 5 }),
      row({ code: 'SPE', name: 'Specials',  missing: 0, isSpecials: true }),
      row({ code: 'BRA', name: 'Brazil',    missing: 0 }),
    ]);
    expect(out.map((r) => r.code)).toEqual(['ARG', 'BRA', 'SPE']);
  });
});

describe('isNearBg', () => {
  it('flags Germany (#1A1A1A) against the default bg-card', () => {
    expect(isNearBg('#1A1A1A')).toBe(true);
  });
  it('does not flag Japan (#000C66) — deep navy is still distinguishable', () => {
    expect(isNearBg('#000C66')).toBe(false);
  });
  it('does not flag Brazil yellow', () => {
    expect(isNearBg('#FFDF00')).toBe(false);
  });
  it('does not flag pure white', () => {
    expect(isNearBg('#FFFFFF')).toBe(false);
  });
  it('returns false for malformed input', () => {
    expect(isNearBg('not-a-hex')).toBe(false);
  });
});
