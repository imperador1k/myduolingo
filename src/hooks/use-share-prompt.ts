import { useEffect } from "react";
import { useShareModalStore } from "@/store/use-share-modal-store";

const SHARE_PROMPT_KEY = "lastSharePrompt";
const DAYS_DELAY = 5;

export const useSharePrompt = () => {
  const { openModal } = useShareModalStore();

  useEffect(() => {
    // Wait a few seconds so it doesn't interrupt the immediate feed load
    const timeout = setTimeout(() => {
      const lastPromptStr = localStorage.getItem(SHARE_PROMPT_KEY);
      const now = new Date().getTime();

      if (!lastPromptStr) {
        // First time ever - Set it for 3 days from now
        // so it doesn't appear immediately on a fresh account
        localStorage.setItem(SHARE_PROMPT_KEY, now.toString());
      } else {
        const lastPrompt = parseInt(lastPromptStr, 10);
        const daysPassed = (now - lastPrompt) / (1000 * 60 * 60 * 24);

        if (daysPassed >= DAYS_DELAY) {
          openModal();
          localStorage.setItem(SHARE_PROMPT_KEY, now.toString());
        }
      }
    }, 10000); // 10 seconds delay

    return () => clearTimeout(timeout);
  }, [openModal]);
};
