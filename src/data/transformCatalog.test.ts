import { describe, it, expect } from 'vitest';
import { transformCatalog } from './transformCatalog';
import { rawCatalog } from './catalog';
import { inferType } from './inferType';

describe('transformCatalog', () => {
  const defaultStickers = transformCatalog(rawCatalog);
  const europeanStickers = transformCatalog(rawCatalog, { includeShinies: true });

  it('default: has exactly 980 stickers (Singapore edition)', () => {
    expect(defaultStickers).toHaveLength(980);
  });

  it('with includeShinies: has exactly 1034 stickers (European edition)', () => {
    expect(europeanStickers).toHaveLength(1034);
  });

  it('assigns sortIndex equal to array index', () => {
    defaultStickers.forEach((s, i) => expect(s.sortIndex).toBe(i));
  });

  it('starts with 00 / Panini Logo / special', () => {
    expect(defaultStickers[0]).toMatchObject({ code: '00', type: 'special', name: 'Panini Logo' });
  });

  it('ends with FWC19 / legend', () => {
    const last = defaultStickers[defaultStickers.length - 1];
    expect(last).toMatchObject({ code: 'FWC19', type: 'legend' });
  });

  it('starts every sticker as unreviewed with owned=0 and a non-empty name', () => {
    for (const s of defaultStickers) {
      expect(s.reviewed).toBe(false);
      expect(s.owned).toBe(0);
      expect(s.name && s.name.length > 0).toBe(true);
    }
  });

  it('emits unique codes', () => {
    const codes = defaultStickers.map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('default: excludes all s-suffix codes', () => {
    expect(defaultStickers.some((s) => s.code.endsWith('s'))).toBe(false);
  });

  it('default: flags 48 shinies (badges only)', () => {
    const shinyByOutput = defaultStickers.filter((s) => s.isShiny).length;
    const shinyByRule = rawCatalog.filter(
      (e) => !e.code.endsWith('s') && inferType(e) === 'badge',
    ).length;
    expect(shinyByOutput).toBe(48);
    expect(shinyByOutput).toBe(shinyByRule);
  });

  it('with includeShinies: flags 102 shinies (48 badges + 54 s-suffix)', () => {
    const shinyByOutput = europeanStickers.filter((s) => s.isShiny).length;
    const shinyByRule = rawCatalog.filter(
      (e) => e.code.endsWith('s') || inferType(e) === 'badge',
    ).length;
    expect(shinyByOutput).toBe(102);
    expect(shinyByOutput).toBe(shinyByRule);
  });

  it('default: has a sane type distribution that sums to 980', () => {
    const by: Record<string, number> = {};
    for (const s of defaultStickers) by[s.type] = (by[s.type] ?? 0) + 1;
    expect(by.badge).toBe(48);
    expect(by.group).toBe(48);
    expect(by.legend).toBe(11);
    expect(by.player + by.special + by.badge + by.group + by.legend).toBe(980);
  });
});
