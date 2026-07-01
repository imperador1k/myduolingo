"use client";

import { useEffect, useRef } from "react";
import { usePreferencesStore } from "@/store/use-preferences-store";
import { syncClientPreferences } from "@/actions/preferences";

interface PreferencesLoaderProps {
  serverPreferences: Record<string, any> | null;
}

export const PreferencesLoader = ({
  serverPreferences,
}: PreferencesLoaderProps) => {
  const hydratePreferences = usePreferencesStore(
    (state) => state.hydratePreferences,
  );
  const state = usePreferencesStore((state) => state);
  const isHydrated = useRef(false);

  useEffect(() => {
    if (isHydrated.current) return;

    const serverHasPrefs =
      serverPreferences && Object.keys(serverPreferences).length > 0;

    if (serverHasPrefs) {
      hydratePreferences(serverPreferences);
    } else {
      // Server has NO preferences (e.g. brand new account).
      // Push the current local preferences to the server to persist them.
      const localPrefsToSync = {
        hasSeenWalkthrough: state.hasSeenWalkthrough,
        hasSeenQuestsModal: state.hasSeenQuestsModal,
        hasSeenPracticeModal: state.hasSeenPracticeModal,
        hasSeenArcadeModal: state.hasSeenArcadeModal,
        hasSeenLeagueModal: state.hasSeenLeagueModal,
        hasSeenIntroOverlay: state.hasSeenIntroOverlay,
        isMuted: state.isMuted,
        nativeLanguage: state.nativeLanguage,
      };

      // Only sync if there's actually something non-default to save
      if (
        Object.values(localPrefsToSync).some(
          (val) => val !== false && val !== null,
        )
      ) {
        syncClientPreferences(localPrefsToSync).catch(console.error);
      }
    }
    isHydrated.current = true;
  }, [serverPreferences, hydratePreferences, state]);

  return null;
};
