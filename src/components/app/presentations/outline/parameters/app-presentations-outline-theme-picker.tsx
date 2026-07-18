"use client";

import { useTranslations } from "next-intl";

import { PresentationTheme } from "@/lib/drizzle/schema/presentation";
import { THEME_KEYS } from "@/schemas/app/presentation-schema";
import { presentationThemes } from "@/lib/excalidraw/themes/presentation-themes";

import { AppPresentationsOutlineThemeCard } from "@/components/app/presentations/outline/parameters/app-presentations-outline-theme-card";

// Swatch vem da paleta real (presentation-themes.ts, a mesma que
// theme-applicator.ts usa pra resolver cor no slide gerado) — canvas ancora
// a identidade clara/escura, primary é a cor de assinatura, accent mostra o
// tom de container/zona. Nunca inventar cor aqui: se o tema mudar, o
// seletor tem que refletir exatamente o que a geração vai produzir.
const { getByKey } = presentationThemes();

function swatchFor(key: string): string[] {
  const { palette } = getByKey(key);
  return [palette.canvas, palette.primary, palette.accent];
}

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
            swatch={swatchFor(THEME_KEYS[themeValue])}
            selected={value === themeValue}
            onSelect={() => onChange(themeValue)}
          />
        ))}
      </div>
    </div>
  );
}
