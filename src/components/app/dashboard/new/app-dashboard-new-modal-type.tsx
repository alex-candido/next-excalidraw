"use client";

import { GalleryVerticalEnd, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

type PresentationTypeValue =
  (typeof PresentationType)[keyof typeof PresentationType];

interface AppDashboardNewModalTypeProps {
  value: PresentationTypeValue;
  onChange: (value: PresentationTypeValue) => void;
}

const TYPE_OPTIONS = [
  {
    value: PresentationType.multi,
    icon: GalleryVerticalEnd,
    labelKey: "multi" as const,
    descriptionKey: "multiDescription" as const,
  },
  {
    value: PresentationType.single,
    icon: PenLine,
    labelKey: "single" as const,
    descriptionKey: "singleDescription" as const,
  },
] as const;

export function AppDashboardNewModalType({
  value,
  onChange,
}: AppDashboardNewModalTypeProps) {
  const t = useTranslations("app.new.type");

  return (
    <div className="app-dashboard-new-modal-type flex gap-2.5">
      {TYPE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "app-dashboard-new-modal-type-card flex flex-1 flex-col gap-3 rounded-xl border p-3 text-left transition-colors",
              isSelected
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50",
            )}
          >
            <div
              className={cn(
                "app-dashboard-new-modal-type-card-icon flex size-8 items-center justify-center rounded-md",
                isSelected ? "bg-primary/10" : "bg-muted",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  isSelected ? "text-primary" : "text-muted-foreground",
                )}
              />
            </div>
            <div className="app-dashboard-new-modal-type-card-text flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {t(option.labelKey)}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {t(option.descriptionKey)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
