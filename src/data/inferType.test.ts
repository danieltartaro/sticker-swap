import { describe, it, expect } from 'vitest';
import { inferType } from './inferType';
import type { CatalogEntry } from './catalog';
import type { StickerType } from './types';

const cases: Array<[CatalogEntry, StickerType]> = [
  [{ code: '00', name: 'Panini Logo', team: 'We Are Panini' }, 'special'],
  [{ code: 'FWC1', name: 'Official Emblem1', team: 'FIFA World Cup 2026' }, 'special'],
  [{ code: 'FWC7', name: 'Mexico', team: 'Host Countries and Cities' }, 'special'],
  [{ code: 'FWC15', name: 'Brazil 1994', team: 'FIFA World Cup History' }, 'legend'],
  [{ code: 'MEX1', name: 'Emblem', team: 'Mexico' }, 'badge'],
  [{ code: 'MEX13', name: 'Team Photo', team: 'Mexico' }, 'group'],
  [{ code: 'MEX5', name: 'Cesar Montes', team: 'Mexico' }, 'player'],
  [{ code: 'GER2s', name: 'Marc-André ter Stegen', team: 'Germany' }, 'player'],
];

describe('inferType', () => {
  for (const [entry, expected] of cases) {
    it(`${entry.code} (${entry.team}) → ${expected}`, () => {
      expect(inferType(entry)).toBe(expected);
    });
  }

  it('falls back to player for unknown shapes', () => {
    expect(inferType({ code: 'ZZZ99', name: 'Some Name', team: 'Some Team' })).toBe('player');
  });
});
