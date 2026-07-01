"use client";

import { createContext, useContext, useEffect } from "react";
import useSound from "use-sound";
import { useTranslations } from "next-intl";
import { usePreferencesStore } from "@/store/use-preferences-store";

type UISoundsContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  playClick: () => void;
  playWhoosh: () => void;
  playReward: () => void;
  playStart: () => void;
  playPop: () => void;
  playFahh: () => void;
};

const UISoundsContext = createContext<UISoundsContextType | null>(null);

export const UISoundsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isMuted = usePreferencesStore((state) => state.isMuted);
  const setPreference = usePreferencesStore((state) => state.setPreference);

  const toggleMute = () => {
    setPreference("isMuted", !isMuted);
  };

  const options = { soundEnabled: !isMuted };

  const [playClick] = useSound("/sounds/click.mp3", {
    volume: 0.5,
    ...options,
  });
  const [playWhoosh] = useSound("/sounds/whoosh.mp3", {
    volume: 0.4,
    ...options,
  });
  const [playReward] = useSound("/sounds/reward.mp3", {
    volume: 0.6,
    ...options,
  });
  const [playStart] = useSound("/sounds/start.mp3", {
    volume: 0.6,
    ...options,
  });
  const [playPop] = useSound("/sounds/pop.mp3", { volume: 0.4, ...options });
  const [playFahh] = useSound("/sounds/fahh.mp3", { volume: 0.6, ...options });

  return (
    <UISoundsContext.Provider
      value={{
        isMuted,
        toggleMute,
        playClick: () => playClick(),
        playWhoosh: () => playWhoosh(),
        playReward: () => playReward(),
        playStart: () => playStart(),
        playPop: () => playPop(),
        playFahh: () => playFahh(),
      }}
    >
      {children}
    </UISoundsContext.Provider>
  );
};

export const useUISounds = () => {
  const t = useTranslations("providers");
  const context = useContext(UISoundsContext);
  if (!context) {
    // If not wrapped in provider (e.g. testing or error boundary), return noop functions
    return {
      isMuted: false,
      toggleMute: () => {},
      playClick: () => {},
      playWhoosh: () => {},
      playReward: () => {},
      playStart: () => {},
      playPop: () => {},
      playFahh: () => {},
    };
  }
  return context;
};
