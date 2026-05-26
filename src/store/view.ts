import { create } from 'zustand';

export type View = 'first-inventory' | 'lookup';

type ViewState = {
  view: View | null;
  setView: (view: View) => void;
};

export const useViewStore = create<ViewState>((set) => ({
  view: null,
  setView: (view) => set({ view }),
}));
