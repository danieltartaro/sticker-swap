import { describe, it, expect } from 'vitest';
import { JERSEY_PRIMARY, resolveJerseyColor } from './jerseyColors';

describe('JERSEY_PRIMARY', () => {
  const starterPrefixes = ['BRA', 'ARG', 'GER', 'FRA', 'ENG', 'ESP', 'NED', 'POR'] as const;

  for (const prefix of starterPrefixes) {
    it(`${prefix} resolves for a player code`, () => {
      const color = resolveJerseyColor({ code: `${prefix}1`, type: 'player' });
      expect(color).toBe(JERSEY_PRIMARY[prefix]);
    });
  }

  it('has 48 entries (all nation prefixes in catalog)', () => {
    expect(Object.keys(JERSEY_PRIMARY)).toHaveLength(48);
  });

  it('every entry is a valid 6-char hex', () => {
    for (const [prefix, hex] of Object.entries(JERSEY_PRIMARY)) {
      expect(hex, `${prefix} should be #RRGGBB`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('resolveJerseyColor', () => {
  it('resolves a badge code with a known prefix (stripe-on-badge path)', () => {
    expect(resolveJerseyColor({ code: 'BRA-BADGE', type: 'badge' })).toBe('#FFDF00');
  });

  it('returns undefined for an unknown 3-letter prefix', () => {
    expect(resolveJerseyColor({ code: 'XYZ5', type: 'player' })).toBeUndefined();
  });

  it('returns undefined for legend type even when prefix matches', () => {
    expect(resolveJerseyColor({ code: 'BRA1', type: 'legend' })).toBeUndefined();
  });

  it('returns undefined for special type even when prefix matches', () => {
    expect(resolveJerseyColor({ code: 'BRA1', type: 'special' })).toBeUndefined();
  });

  it('returns undefined for group type even when prefix matches', () => {
    expect(resolveJerseyColor({ code: 'BRA1', type: 'group' })).toBeUndefined();
  });

  it('returns undefined for a code with no leading alpha prefix (00 — Panini Logo)', () => {
    expect(resolveJerseyColor({ code: '00', type: 'special' })).toBeUndefined();
  });
});
