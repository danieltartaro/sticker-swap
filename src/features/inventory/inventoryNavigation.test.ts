import { describe, it, expect } from 'vitest';
import { nextStateOnDecision, arrowVisibility } from './inventoryNavigation';

describe('nextStateOnDecision', () => {
  it('advances both cursors when at the leading edge', () => {
    expect(nextStateOnDecision(3, 3)).toEqual({ currentIndex: 4, furthestIndex: 4 });
  });

  it('advances only currentIndex when rewound mid-pass', () => {
    expect(nextStateOnDecision(2, 5)).toEqual({ currentIndex: 3, furthestIndex: 5 });
  });

  it('advances both to total when deciding on the last sticker at the leading edge', () => {
    expect(nextStateOnDecision(979, 979)).toEqual({ currentIndex: 980, furthestIndex: 980 });
  });

  it('catches up the leading edge when current+1 exceeds furthest', () => {
    // Pathological / defensive: shouldn't happen via UI flow but the math should still hold.
    expect(nextStateOnDecision(5, 3)).toEqual({ currentIndex: 6, furthestIndex: 6 });
  });
});

describe('arrowVisibility', () => {
  it('hides both arrows on a fresh mount', () => {
    expect(arrowVisibility(0, 0)).toEqual({ showLeft: false, showRight: false });
  });

  it('shows only right when rewound to the start', () => {
    expect(arrowVisibility(0, 5)).toEqual({ showLeft: false, showRight: true });
  });

  it('shows both arrows when rewound mid-pass', () => {
    expect(arrowVisibility(3, 5)).toEqual({ showLeft: true, showRight: true });
  });

  it('shows only left at the leading edge mid-pass', () => {
    expect(arrowVisibility(5, 5)).toEqual({ showLeft: true, showRight: false });
  });

  it('shows only left in the done state (allows rewind from done)', () => {
    expect(arrowVisibility(980, 980)).toEqual({ showLeft: true, showRight: false });
  });
});
