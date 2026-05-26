import { describe, it, expect } from 'vitest';
import { inventoryDone } from './inventoryDone';

describe('inventoryDone', () => {
  it('returns false when the db is empty', () => {
    expect(inventoryDone(0, 0)).toBe(false);
  });

  it('returns false when nothing has been reviewed', () => {
    expect(inventoryDone(980, 980)).toBe(false);
  });

  it('returns false mid-pass', () => {
    expect(inventoryDone(980, 5)).toBe(false);
  });

  it('returns true when every sticker is reviewed', () => {
    expect(inventoryDone(980, 0)).toBe(true);
  });
});
