import { describe, it, expect } from 'vitest';
import { INTENT_BG } from './ActionButton';

describe('INTENT_BG', () => {
  it('maps each intent to the spec FIFA token', () => {
    expect(INTENT_BG.need).toBe('var(--color-fifa-violet)');
    expect(INTENT_BG.have).toBe('var(--color-fifa-green)');
    expect(INTENT_BG.dupe).toBe('var(--color-fifa-orange)');
    expect(INTENT_BG.subtract).toBe('var(--color-fifa-red)');
  });

  it('covers all four intents', () => {
    expect(Object.keys(INTENT_BG).sort()).toEqual(
      ['dupe', 'have', 'need', 'subtract'],
    );
  });
});
