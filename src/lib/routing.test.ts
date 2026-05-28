import { describe, it, expect } from 'vitest';
import { mapCountsToView } from './routing';

describe('mapCountsToView', () => {
  it('returns welcome when the db is empty', () => {
    expect(mapCountsToView(0, 0)).toBe('welcome');
  });

  it('returns welcome when nothing has been reviewed', () => {
    expect(mapCountsToView(980, 0)).toBe('welcome');
  });

  it('returns first-inventory after the first decision', () => {
    expect(mapCountsToView(980, 1)).toBe('first-inventory');
  });

  it('returns first-inventory near the end of the pass', () => {
    expect(mapCountsToView(980, 979)).toBe('first-inventory');
  });

  it('returns country-browse when the pass is complete', () => {
    expect(mapCountsToView(980, 980)).toBe('country-browse');
  });
});
