import type { PickerRow } from './countryBrowseLogic';
import { isNearBg } from './countryBrowseLogic';

type CountryPickerProps = {
  open: boolean;
  rows: PickerRow[];
  onSelect: (code: string) => void;
  onClose: () => void;
};

function SpecialsStar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="#FFFFFF"
      aria-hidden="true"
    >
      <path d="M12 2 L14.6 8.6 L21.6 9.2 L16.3 13.9 L18 20.8 L12 17.1 L6 20.8 L7.7 13.9 L2.4 9.2 L9.4 8.6 Z" />
    </svg>
  );
}

function RowSwatch({ row }: { row: PickerRow }) {
  const needsBorder = !row.isSpecials && isNearBg(row.swatchColor);
  return (
    <div
      style={{
        background: row.swatchColor,
        border: needsBorder ? '1px solid var(--color-text-dim)' : undefined,
      }}
      className="w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0"
    >
      {row.isSpecials && <SpecialsStar />}
    </div>
  );
}

export default function CountryPicker({
  open,
  rows,
  onSelect,
  onClose,
}: CountryPickerProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-10">
      <button
        type="button"
        aria-label="Close country picker"
        onClick={onClose}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-2xl flex flex-col"
        style={{
          background: 'var(--color-bg-card)',
          maxHeight: '75dvh',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)',
        }}
      >
        <div className="flex justify-center pt-2">
          <div
            className="h-1 w-10 rounded-full"
            style={{ background: 'var(--color-text-dim)' }}
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="font-sans text-base text-text-primary">Pick a country</div>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-text-muted min-h-[44px] px-2"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {rows.map((row) => {
            const completed = row.missing === 0;
            return (
              <button
                key={row.code}
                type="button"
                onClick={() => onSelect(row.code)}
                style={{ opacity: completed ? 0.5 : 1 }}
                className="w-full flex items-center gap-4 px-3 py-3 min-h-[44px] border-b border-text-dim/30 text-left"
              >
                <RowSwatch row={row} />
                <div className="flex-1 font-sans text-text-primary">
                  {row.name}
                </div>
                <div
                  className="font-sans text-sm font-mono tabular-nums"
                  style={{
                    color: completed
                      ? 'var(--color-fifa-green)'
                      : 'var(--color-text-muted)',
                  }}
                >
                  {completed ? 'complete' : `${row.missing} missing`}
                </div>
                <div className="text-text-dim" aria-hidden="true">›</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
