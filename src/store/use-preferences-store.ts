import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { syncClientPreferences } from "@/actions/preferences";

interface PreferencesState {
  hasSeenWalkthrough: boolean;
  hasSeenQuestsModal: boolean;
  hasSeenPracticeModal: boolean;
  hasSeenArcadeModal: boolean;
  hasSeenLeagueModal: boolean;
  hasSeenIntroOverlay: boolean;
  isMuted: boolean;
  nativeLanguage: string | null;
  // actions
  setPreference: <
    K extends keyof Omit<
      PreferencesState,
      "setPreference" | "hydratePreferences"
    >,
  >(
    key: K,
    value: PreferencesState[K],
  ) => void;
  hydratePreferences: (prefs: Partial<PreferencesState>) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      hasSeenWalkthrough: false,
      hasSeenQuestsModal: false,
      hasSeenPracticeModal: false,
      hasSeenArcadeModal: false,
      hasSeenLeagueModal: false,
      hasSeenIntroOverlay: false,
      isMuted: false,
      nativeLanguage: null,

      setPreference: (key, value) => {
        set({ [key]: value } as any);
        // Fire and forget server sync
        syncClientPreferences({ [key]: value }).catch(console.error);
      },

      hydratePreferences: (prefs) => {
        set({ ...prefs });
      },
    }),
    {
      name: "myduolingo-preferences",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
