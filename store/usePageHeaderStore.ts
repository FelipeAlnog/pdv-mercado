import { create } from 'zustand';

interface PageHeaderState {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  setHeader: (config: { title: string; subtitle?: string; actions?: React.ReactNode }) => void;
}

export const usePageHeaderStore = create<PageHeaderState>((set) => ({
  title: '',
  subtitle: undefined,
  actions: undefined,
  setHeader: ({ title, subtitle, actions }) => set({ title, subtitle, actions }),
}));
