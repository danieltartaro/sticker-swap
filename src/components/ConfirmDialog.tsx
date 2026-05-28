type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div
        className="w-full rounded-2xl px-5 py-6 text-center flex flex-col gap-4"
        style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
      >
        <div className="text-[17px] font-medium">{title}</div>
        <div className="text-[13px] leading-relaxed text-text-muted">
          {body}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 rounded-xl text-[15px] font-medium border"
            style={{
              background: 'transparent',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-text-dim)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 rounded-xl text-[15px] font-medium text-white"
            style={{ background: 'var(--color-fifa-red)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
