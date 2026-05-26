import { describe, it, expect } from 'vitest';
import { TYPE_STYLES } from './TypePill';

describe('TYPE_STYLES', () => {
  it('maps each StickerType to the spec border + text token pair', () => {
    expect(TYPE_STYLES.player).toEqual({
      border: 'var(--type-player-border)',
      text:   'var(--type-player-text)',
    });
    expect(TYPE_STYLES.badge).toEqual({
      border: 'var(--type-badge-border)',
      text:   'var(--type-badge-text)',
    });
    expect(TYPE_STYLES.legend).toEqual({
      border: 'var(--type-legend-border)',
      text:   'var(--type-legend-text)',
    });
    expect(TYPE_STYLES.special).toEqual({
      border: 'var(--type-special-border)',
      text:   'var(--type-special-text)',
    });
    expect(TYPE_STYLES.group).toEqual({
      border: 'var(--type-group-border)',
      text:   'var(--type-group-text)',
    });
  });

  it('covers all five sticker types', () => {
    expect(Object.keys(TYPE_STYLES).sort()).toEqual(
      ['badge', 'group', 'legend', 'player', 'special'],
    );
  });
});
