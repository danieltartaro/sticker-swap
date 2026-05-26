import type { StickerType } from '../data/types';

export const TYPE_STYLES: Record<StickerType, { border: string; text: string }> = {
  player:  { border: 'var(--type-player-border)',  text: 'var(--type-player-text)' },
  badge:   { border: 'var(--type-badge-border)',   text: 'var(--type-badge-text)' },
  legend:  { border: 'var(--type-legend-border)',  text: 'var(--type-legend-text)' },
  special: { border: 'var(--type-special-border)', text: 'var(--type-special-text)' },
  group:   { border: 'var(--type-group-border)',   text: 'var(--type-group-text)' },
};

type TypePillProps = { type: StickerType };

export default function TypePill({ type }: TypePillProps) {
  const { border, text } = TYPE_STYLES[type];
  return (
    <span
      style={{ border: `1px solid ${border}`, color: text }}
      className="bg-transparent rounded px-2 py-0.5 text-[8px] tracking-widest uppercase"
    >
      {type}
    </span>
  );
}
