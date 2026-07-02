"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const t = useTranslations("settings_components");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-4 p-4 border-2 border-stone-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-stone-700 dark:text-slate-200 text-lg">
            {t("theme_title")}
          </h3>
          <p className="text-stone-500 dark:text-slate-400 text-sm">
            {t("theme_desc")}
          </p>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="relative w-16 h-8 rounded-full bg-stone-200 dark:bg-slate-700 transition-colors flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 p-1"
        >
          <div 
            className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${
              isDark ? "translate-x-8" : "translate-x-0"
            }`}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-slate-800" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
