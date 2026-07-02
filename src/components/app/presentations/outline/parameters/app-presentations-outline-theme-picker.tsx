"use client";

import { useTranslations } from "next-intl";

import { PresentationTheme } from "@/lib/drizzle/schema/presentation";
import { THEME_KEYS } from "@/schemas/app/presentation-schema";

import { AppPresentationsOutlineThemeCard } from "@/components/app/presentations/outline/parameters/app-presentations-outline-theme-card";

// Paleta placeholder apenas para preview visual do seletor — a definição
// oficial do objeto de tema (cores semânticas, tipografia) é item do Ciclo 4.
const THEME_SWATCH: Record<number, string[]> = {
  [PresentationTheme.daktilo]: ["#78716c", "#d6d3d1", "#1c1917"],
  [PresentationTheme.noir]: ["#18181b", "#3f3f46", "#fafafa"],
  [PresentationTheme.cornflower]: ["#6495ed", "#93c5fd", "#1e3a5f"],
  [PresentationTheme.indigo]: ["#6366f1", "#a5b4fc", "#312e81"],
  [PresentationTheme.orbit]: ["#0ea5e9", "#7dd3fc", "#0c4a6e"],
  [PresentationTheme.cosmos]: ["#a855f7", "#d8b4fe", "#3b0764"],
  [PresentationTheme.sunset]: ["#f97316", "#fb923c", "#7c2d12"],
  [PresentationTheme.forest]: ["#16a34a", "#86efac", "#14532d"],
  [PresentationTheme.piano]: ["#000000", "#ffffff", "#4b5563"],
  [PresentationTheme.ebony]: ["#3f2e25", "#6b4f3f", "#1a120d"],
};

interface AppPresentationsOutlineThemePickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function AppPresentationsOutlineThemePicker({
  value,
  onChange,
}: AppPresentationsOutlineThemePickerProps) {
  const t = useTranslations("app.outline.parameters.theme");

  return (
    <div className="app-presentations-outline-theme-picker flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{t("label")}</span>
      <div
        role="radiogroup"
        aria-label={t("label")}
        className="app-presentations-outline-theme-picker-grid grid grid-cols-3 gap-2 sm:grid-cols-5"
      >
        {Object.values(PresentationTheme).map((themeValue) => (
          <AppPresentationsOutlineThemeCard
            key={themeValue}
            label={t(`items.${THEME_KEYS[themeValue]}`)}
            swatch={THEME_SWATCH[themeValue]}
            selected={value === themeValue}
            onSelect={() => onChange(themeValue)}
          />
        ))}
      </div>
    </div>
  );
}
