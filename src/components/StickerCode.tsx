import type { ReactNode } from 'react';

export type CodeSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<CodeSize, number> = {
  sm: 24,
  md: 32,
  lg: 46,
  xl: 80,
};

export function getCodeSizePx(size: CodeSize): number {
  return SIZE_PX[size];
}

type StickerCodeProps = {
  size?: CodeSize;
  children: ReactNode;
};

export default function StickerCode({ size = 'lg', children }: StickerCodeProps) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: getCodeSizePx(size),
        letterSpacing: '-0.04em',
        lineHeight: 0.9,
      }}
    >
      {children}
    </span>
  );
}
