import type { ReactNode } from 'react';
import ChromeDivider from './ChromeDivider';

type ScreenLayoutProps = {
  counter: ReactNode;
  card: ReactNode;
  actions: ReactNode;
};

export default function ScreenLayout({ counter, card, actions }: ScreenLayoutProps) {
  return (
    <div
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
      className="h-[100dvh] flex flex-col"
    >
      <header
        className="px-4 py-3 text-center flex-shrink-0"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
      >
        {counter}
      </header>
      <main className="flex-1 flex items-center justify-center px-4 min-h-0">
        {card}
      </main>
      <ChromeDivider />
      <footer
        className="px-4 pt-3 flex-shrink-0"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        {actions}
      </footer>
    </div>
  );
}
