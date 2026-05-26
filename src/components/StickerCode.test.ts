import { describe, it, expect } from 'vitest';
import { getCodeSizePx } from './StickerCode';

describe('getCodeSizePx', () => {
  it('returns spec pixel values for each size', () => {
    expect(getCodeSizePx('sm')).toBe(24);
    expect(getCodeSizePx('md')).toBe(32);
    expect(getCodeSizePx('lg')).toBe(46);
    expect(getCodeSizePx('xl')).toBe(80);
  });
});
