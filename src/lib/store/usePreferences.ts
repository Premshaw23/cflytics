import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  defaultHandle: string;
  showTags: boolean;
  setDefaultHandle: (handle: string) => void;
  toggleShowTags: () => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      defaultHandle: '',
      showTags: true,
      setDefaultHandle: (handle) => set({ defaultHandle: handle }),
      toggleShowTags: () => set((state) => ({ showTags: !state.showTags })),
    }),
    {
      name: 'codey-preferences',
    }
  )
);
