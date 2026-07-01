"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslations } from "next-intl";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { haptics } from "@/lib/haptics";
import confetti from "canvas-confetti";
import { usePreferencesStore } from "@/store/use-preferences-store";

// Helper to render our World-Class UI inside the popover description
const renderGamifiedStep = (
  title: string,
  desc: string,
  iconHtml: string,
  currentStep: number,
  totalSteps: number,
) => {
  const progressPercent = (currentStep / totalSteps) * 100;
  return `
    <div class="gamified-step-container">
      <div class="gamified-progress-bg">
        <div class="gamified-progress-fill" style="width: ${progressPercent}%;">
          <div class="gamified-progress-highlight"></div>
        </div>
      </div>
      
      <div class="gamified-step-content">
        <div class="gamified-step-icon">
          ${iconHtml}
        </div>
        <div class="gamified-step-text">
          <h3 class="gamified-step-title">${title}</h3>
          <p class="gamified-step-desc">${desc}</p>
        </div>
      </div>
    </div>
  `;
};

// Bulletproof helper to find the element based on active Tailwind breakpoint dynamically!
const getTargetSelector = (desktopId: string, mobileId: string): string => {
  const isMobileView =
    typeof window !== "undefined" && window.innerWidth < 1024;
  return `#${isMobileView ? mobileId : desktopId}`;
};

export const AppWalkthrough = () => {
  const t = useTranslations("walkthrough");
  const { playClick, playWhoosh, playReward } = useUISounds();
  const hasSeenWalkthrough = usePreferencesStore(
    (state) => state.hasSeenWalkthrough,
  );
  const setPreference = usePreferencesStore((state) => state.setPreference);

  useEffect(() => {
    if (!hasSeenWalkthrough) {
      const timer = setTimeout(() => {
        const total = 7;

        const driverObj = driver({
          showProgress: false,
          animate: true,
          allowClose: true,
          popoverClass: "gamified-tour-popover",
          doneBtnText: t("done", { defaultValue: "Let's Go!" }),
          nextBtnText: t("next", { defaultValue: "Próximo" }),
          prevBtnText: t("prev", { defaultValue: "Anterior" }),

          onHighlightStarted: (element, step) => {
            document.body.classList.add("is-tour-active");

            // Dynamically adjust popover position to prevent covering the buttons on mobile!
            if (step.popover) {
              const isMobileView =
                typeof window !== "undefined" && window.innerWidth < 1024;
              if (isMobileView) {
                step.popover.side = "top";
                step.popover.align = "center";
              } else {
                step.popover.side = "right";
                step.popover.align = "start";
              }
            }
          },

          onNextClick: (element, step, { state }) => {
            playClick();
            haptics.light();

            if (state.activeIndex === 3) {
              const isMobileView =
                typeof window !== "undefined" && window.innerWidth < 1024;

              if (isMobileView) {
                if ((window as any).openMobileNav)
                  (window as any).openMobileNav();
              } else {
                if ((window as any).openDesktopNav)
                  (window as any).openDesktopNav();
              }

              setTimeout(() => {
                driverObj.moveNext();
              }, 700);
            } else if (state.activeIndex === 6) {
              const isMobileView =
                typeof window !== "undefined" && window.innerWidth < 1024;

              if (isMobileView) {
                if ((window as any).closeMobileNav)
                  (window as any).closeMobileNav();
              } else {
                if ((window as any).closeDesktopNav)
                  (window as any).closeDesktopNav();
              }

              setTimeout(() => {
                driverObj.moveNext();
              }, 400);
            } else {
              driverObj.moveNext();
            }
          },
          onPrevClick: (element, step, { state }) => {
            playClick();
            haptics.light();

            if (state.activeIndex === 7) {
              // Going back from Step 8 to Step 7 (Shop)
              const isMobileView =
                typeof window !== "undefined" && window.innerWidth < 1024;
              if (isMobileView) {
                if ((window as any).openMobileNav)
                  (window as any).openMobileNav();
              } else {
                if ((window as any).openDesktopNav)
                  (window as any).openDesktopNav();
              }
              setTimeout(() => driverObj.movePrevious(), 700);
            } else if (state.activeIndex === 4) {
              // Going back from Step 5 (Leagues) to Step 4 (Menu Secreto)
              const isMobileView =
                typeof window !== "undefined" && window.innerWidth < 1024;
              if (isMobileView) {
                if ((window as any).closeMobileNav)
                  (window as any).closeMobileNav();
              } else {
                if ((window as any).closeDesktopNav)
                  (window as any).closeDesktopNav();
              }
              setTimeout(() => driverObj.movePrevious(), 400);
            } else {
              driverObj.movePrevious();
            }
          },
          onDestroyStarted: () => {
            document.body.classList.remove("is-tour-active");

            // Close the menu if it was opened during the tutorial
            if ((window as any).closeMobileNav)
              (window as any).closeMobileNav();
            if ((window as any).closeDesktopNav)
              (window as any).closeDesktopNav();

            setPreference("hasSeenWalkthrough", true);
            driverObj.destroy();
          },

          steps: [
            {
              popover: {
                description: renderGamifiedStep(
                  t("welcome_title", { defaultValue: "Boas-vindas!" }),
                  t("welcome_desc", {
                    defaultValue: "Prepara-te para a viagem!",
                  }),
                  `<img src="/mascot.svg" style="width:70px; height:70px; animation: bounce 1.5s infinite;" />`,
                  1,
                  total,
                ),
                side: "bottom",
                align: "center",
              },
            },
            {
              element: getTargetSelector("tour-learn", "tour-learn-mobile"),
              popover: {
                description: renderGamifiedStep(
                  t("learn_title", { defaultValue: "O Teu Mapa" }),
                  t("learn_desc", { defaultValue: "Ganha XP!" }),
                  `<div style="font-size: 3rem;">📚</div>`,
                  2,
                  total,
                ),
                side: "right",
                align: "start",
              },
            },
            {
              element: getTargetSelector(
                "tour-practice",
                "tour-practice-mobile",
              ),
              popover: {
                description: renderGamifiedStep(
                  t("practice_title", { defaultValue: "Prática com IA" }),
                  t("practice_desc", { defaultValue: "Falar com robôs!" }),
                  `<div style="font-size: 3rem;">🤖</div>`,
                  3,
                  total,
                ),
                side: "right",
                align: "start",
              },
            },
            {
              element: getTargetSelector(
                "tour-more-desktop",
                "tour-more-mobile",
              ),
              popover: {
                description: renderGamifiedStep(
                  `🤫 O Menu Secreto`,
                  `Clica em "Próximo" para eu te revelar os tesouros escondidos!`,
                  `<div style="font-size: 3rem;">🗝️</div>`,
                  4,
                  total,
                ),
                side: "right",
                align: "start",
              },
            },
            {
              element: getTargetSelector(
                "tour-leaderboard",
                "tour-leaderboard-mobile",
              ),
              popover: {
                description: renderGamifiedStep(
                  t("leaderboard_title", {
                    defaultValue: "Ligas Competitivas",
                  }),
                  t("leaderboard_desc", {
                    defaultValue: "Consegues chegar ao Top 3?",
                  }),
                  `<div style="font-size: 3rem;">🏆</div>`,
                  5,
                  total,
                ),
                side: "top",
                align: "center",
              },
            },
            {
              element: getTargetSelector("tour-quests", "tour-quests-mobile"),
              popover: {
                description: renderGamifiedStep(
                  t("quests_title", { defaultValue: "Missões Diárias" }),
                  t("quests_desc", { defaultValue: "Novos desafios!" }),
                  `<div style="font-size: 3rem;">🎯</div>`,
                  6,
                  total,
                ),
                side: "top",
                align: "center",
              },
            },
            {
              element: getTargetSelector("tour-shop", "tour-shop-mobile"),
              popover: {
                description: renderGamifiedStep(
                  t("shop_title", { defaultValue: "A Loja" }),
                  t("shop_desc", { defaultValue: "Usa moedas suadas." }),
                  `<div style="font-size: 3rem;">🛍️</div>`,
                  7,
                  total,
                ),
                side: "top",
                align: "center",
              },
            },
            {
              popover: {
                description: renderGamifiedStep(
                  t("ready_title", { defaultValue: "Tudo Pronto!" }),
                  t("ready_desc", { defaultValue: "Agora é contigo!" }),
                  `<div style="font-size: 3rem;">✨</div>`,
                  8,
                  total,
                ),
                side: "bottom",
                align: "center",
                onPopoverRender: () => {
                  playReward();
                  haptics.success();
                  confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ["#FFC800", "#58CC02", "#1CB0F6"],
                    zIndex: 1000000,
                  });
                },
              },
            },
          ],
        });

        playWhoosh();
        driverObj.drive();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [t, playClick, playWhoosh, playReward, hasSeenWalkthrough]);

  return null;
};
