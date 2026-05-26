import type { ReactNode } from 'react';
import type { StickerType } from '../data/types';
import StickerCode, { type CodeSize } from './StickerCode';
import TypePill from './TypePill';
import TeamStripe from './TeamStripe';

type CardProps = {
  code: string;
  name?: string;
  type: StickerType;
  teamColor?: string;
  isShiny?: boolean;
  codeSize?: CodeSize;
};

function ChromeFrame({ active, children }: { active: boolean; children: ReactNode }) {
  if (!active) return <>{children}</>;
  return (
    <div
      style={{
        padding: 1.5,
        background: 'var(--gradient-chrome-edge)',
        borderRadius: 13.5,
      }}
    >
      {children}
    </div>
  );
}

export default function Card({
  code,
  name,
  type,
  teamColor,
  isShiny = false,
  codeSize = 'lg',
}: CardProps) {
  return (
    <div className="w-full max-w-sm">
      <ChromeFrame active={isShiny}>
        <div
          style={{ background: 'var(--color-bg-card)' }}
          className="min-h-[280px] flex flex-col rounded-xl overflow-hidden"
        >
          {teamColor && <TeamStripe color={teamColor} />}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 text-text-primary">
            <StickerCode size={codeSize}>{code}</StickerCode>
            {name && <div className="font-sans text-text-muted text-sm">{name}</div>}
            <TypePill type={type} />
          </div>
        </div>
      </ChromeFrame>
    </div>
  );
}
