export type ActionIntent = 'need' | 'have' | 'dupe' | 'subtract';

export const INTENT_BG: Record<ActionIntent, string> = {
  need:     'var(--color-fifa-violet)',
  have:     'var(--color-fifa-green)',
  dupe:     'var(--color-fifa-orange)',
  subtract: 'var(--color-fifa-red)',
};

type ActionButtonProps = {
  intent: ActionIntent;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export default function ActionButton({ intent, label, onClick, disabled = false }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ background: INTENT_BG[intent] }}
      className={`text-white rounded-md py-3 w-full min-h-[44px] ${disabled ? 'opacity-50' : ''}`}
    >
      {label}
    </button>
  );
}
