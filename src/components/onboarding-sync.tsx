"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { onSelectCourse } from "@/actions/user-progress";
import { useRouter } from "next/navigation";

interface OnboardingSyncProps {
  isFullScreen?: boolean;
}

export const OnboardingSync = ({ isFullScreen }: OnboardingSyncProps) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { 
    selectedCourse, 
    motivation, 
    experienceLevel, 
    placementResults,
    isOnboardingComplete,
  } = useOnboardingStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const syncData = async () => {
      // 1. Try to get data from Store (Email Signup flow)
      // 2. Try to get data from Cookies (OAuth/Google flow)
      
      let dataToSync = null;

      if (selectedCourse && isOnboardingComplete) {
        dataToSync = {
          courseId: selectedCourse,
          motivation,
          experienceLevel,
          cefrLevel: placementResults?.level || null
        };
      } else {
        // Look for cookie (OAuth flow)
        const cookies = document.cookie.split("; ");
        const onboardingCookie = cookies.find(row => row.startsWith("onboarding_data="));
        if (onboardingCookie) {
          try {
            dataToSync = JSON.parse(decodeURIComponent(onboardingCookie.split("=")[1]));
            // Map cookie fields to expected names
            if (dataToSync.selectedCourse) {
              dataToSync.courseId = dataToSync.selectedCourse;
            }
          } catch (e) {
            console.error("Erro ao ler cookie de onboarding:", e);
          }
        }
      }

      if (isUserLoaded && user && dataToSync && !isSyncing) {
        setIsSyncing(true);
        try {
          console.log("Sincronizando dados para o utilizador:", user.id);
          
          await onSelectCourse(
            dataToSync.courseId, 
            dataToSync.motivation, 
            dataToSync.experienceLevel, 
            dataToSync.cefrLevel
          );
          
          // Cleanup
          localStorage.removeItem("onboarding-storage");
          document.cookie = "onboarding_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "onboarding_completed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          
          // Trigger server-side refresh
          router.refresh();
        } catch (error) {
          console.error("Erro ao sincronizar onboarding:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    syncData();
  }, [isUserLoaded, user, selectedCourse, isOnboardingComplete, motivation, experienceLevel, placementResults, isSyncing, router]);

  return null;
};
