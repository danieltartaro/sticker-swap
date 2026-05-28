import type { StickerType } from '../data/types';
import StickerCode from './StickerCode';
import TypePill from './TypePill';
import TeamStripe from './TeamStripe';

type GridCardProps = {
  code: string;
  name?: string;
  type: StickerType;
  teamColor?: string;
  fading: boolean;
  onGotIt: () => void;
};

export default function GridCard({
  code,
  name,
  type,
  teamColor,
  fading,
  onGotIt,
}: GridCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        opacity: fading ? 0 : 1,
        transform: fading ? 'scale(0.95)' : 'scale(1)',
        transition: 'opacity 220ms ease, transform 220ms ease',
      }}
      className="flex flex-col rounded-xl overflow-hidden"
    >
      {teamColor && <TeamStripe color={teamColor} />}
      <div className="flex-1 flex flex-col items-center gap-2 px-3 pt-4 pb-3 text-text-primary">
        <StickerCode size="lg">{code}</StickerCode>
        {name && (
          <div className="font-sans text-text-muted text-xs text-center">
            {name}
          </div>
        )}
        <TypePill type={type} />
      </div>
      <button
        type="button"
        onClick={onGotIt}
        disabled={fading}
        style={{ background: 'var(--color-fifa-green)' }}
        className="text-white font-sans py-2 mx-3 mb-3 rounded-md min-h-[44px]"
      >
        Got it
      </button>
    </div>
  );
}
