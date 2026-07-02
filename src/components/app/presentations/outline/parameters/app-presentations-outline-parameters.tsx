"use client";

import { useTranslations } from "next-intl";

import { AppPresentationsOutlineAmountPicker } from "@/components/app/presentations/outline/parameters/app-presentations-outline-amount-picker";
import { AppPresentationsOutlineThemePicker } from "@/components/app/presentations/outline/parameters/app-presentations-outline-theme-picker";

interface AppPresentationsOutlineParametersProps {
  theme: number;
  onThemeChange: (value: number) => void;
  amount: number;
  onAmountChange: (value: number) => void;
}

export function AppPresentationsOutlineParameters({
  theme,
  onThemeChange,
  amount,
  onAmountChange,
}: AppPresentationsOutlineParametersProps) {
  const t = useTranslations("app.outline.parameters");

  return (
    <div className="app-presentations-outline-parameters flex flex-col gap-4 rounded-lg border bg-card/50 p-4">
      <div className="app-presentations-outline-parameters-header flex flex-col gap-1">
        <h3 className="text-sm font-semibold">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>
      <AppPresentationsOutlineThemePicker value={theme} onChange={onThemeChange} />
      <AppPresentationsOutlineAmountPicker value={amount} onChange={onAmountChange} />
    </div>
  );
}
