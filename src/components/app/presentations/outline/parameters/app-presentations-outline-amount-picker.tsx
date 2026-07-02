"use client";

import { useTranslations } from "next-intl";

import { PresentationAmount } from "@/lib/drizzle/schema/presentation";
import { AMOUNT_RANGE } from "@/schemas/app/presentation-schema";

import { AMOUNT_KEY } from "@/components/app/presentations/outline/outline-enum-labels";
import { AppPresentationsOutlineAmountCard } from "@/components/app/presentations/outline/parameters/app-presentations-outline-amount-card";

interface AppPresentationsOutlineAmountPickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function AppPresentationsOutlineAmountPicker({
  value,
  onChange,
}: AppPresentationsOutlineAmountPickerProps) {
  const t = useTranslations("app.outline.parameters.amount");

  return (
    <div className="app-presentations-outline-amount-picker flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{t("label")}</span>
      <div
        role="radiogroup"
        aria-label={t("label")}
        className="app-presentations-outline-amount-picker-grid grid grid-cols-2 gap-2 sm:grid-cols-5"
      >
        {Object.values(PresentationAmount).map((amountValue) => {
          const [min, max] = AMOUNT_RANGE[amountValue];
          return (
            <AppPresentationsOutlineAmountCard
              key={amountValue}
              label={t(`items.${AMOUNT_KEY[amountValue]}`)}
              range={
                amountValue === PresentationAmount.auto
                  ? t("autoRange")
                  : t("range", { min, max })
              }
              selected={value === amountValue}
              onSelect={() => onChange(amountValue)}
            />
          );
        })}
      </div>
    </div>
  );
}
