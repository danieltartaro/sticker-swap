export type LookupAction = 'now-have' | 'got-dupe' | 'got-another' | 'gave-away';

export type LookupState = 'need' | 'have' | 'dupe';

export function nextOwned(currentOwned: number, action: LookupAction): number {
  switch (action) {
    case 'now-have':
      return 1;
    case 'got-dupe':
      return 2;
    case 'got-another':
      return currentOwned + 1;
    case 'gave-away':
      return Math.max(currentOwned - 1, 1);
  }
}

export function deriveLookupState(owned: number): LookupState {
  if (owned === 0) return 'need';
  if (owned === 1) return 'have';
  return 'dupe';
}
