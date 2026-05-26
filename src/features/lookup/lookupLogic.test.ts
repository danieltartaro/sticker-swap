import { describe, it, expect } from 'vitest';
import { nextOwned, deriveLookupState } from './lookupLogic';

describe('nextOwned', () => {
  it('NEED → HAVE: owned=0 + now-have → 1', () => {
    expect(nextOwned(0, 'now-have')).toBe(1);
  });

  it('HAVE → DUPE: owned=1 + got-dupe → 2', () => {
    expect(nextOwned(1, 'got-dupe')).toBe(2);
  });

  it('DUPE increments: owned=2 + got-another → 3', () => {
    expect(nextOwned(2, 'got-another')).toBe(3);
  });

  it('DUPE decrements to HAVE floor: owned=2 + gave-away → 1', () => {
    expect(nextOwned(2, 'gave-away')).toBe(1);
  });

  it('DUPE decrements: owned=3 + gave-away → 2', () => {
    expect(nextOwned(3, 'gave-away')).toBe(2);
  });
});

describe('deriveLookupState', () => {
  it('owned=0 → need', () => {
    expect(deriveLookupState(0)).toBe('need');
  });

  it('owned=1 → have', () => {
    expect(deriveLookupState(1)).toBe('have');
  });

  it('owned=2 → dupe', () => {
    expect(deriveLookupState(2)).toBe('dupe');
  });
});
