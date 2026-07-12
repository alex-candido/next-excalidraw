"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const THEME_ICON = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const NEXT_THEME = {
  light: "dark",
  dark: "system",
  system: "light",
} as const;

export function AppPresentationsPresentThemeToggle() {
  const t = useTranslations("app.present.actions");
  const { theme = "system", setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = mounted ? (theme as keyof typeof THEME_ICON) : "system";
  const Icon = THEME_ICON[currentTheme] ?? Monitor;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(NEXT_THEME[currentTheme])}
      aria-label={t("theme")}
      className="app-presentations-present-theme-toggle rounded-full"
    >
      <Icon className="size-3.5" />
    </Button>
  );
}
