"use client";

import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AspectRatio,
  PresentationAudience,
  PresentationLanguage,
  PresentationScenario,
} from "@/lib/drizzle/schema/presentation";

import {
  ASPECT_RATIO_KEY,
  AUDIENCE_KEY,
  LANGUAGE_KEY,
  SCENARIO_KEY,
  type AppPresentationsOutlineParams,
} from "@/components/app/presentations/outline/outline-enum-labels";

const SLIDE_COUNT_VALUES = [0, 5, 8, 10, 15, 20];

type ControlKey = "slideCount" | "language" | "aspectRatio" | "audience" | "scenario";

interface AppPresentationsOutlineHeroControlsProps {
  value: AppPresentationsOutlineParams;
  onChange: (key: ControlKey, value: number) => void;
}

export function AppPresentationsOutlineHeroControls({
  value,
  onChange,
}: AppPresentationsOutlineHeroControlsProps) {
  const t = useTranslations("app.outline.hero.controls");

  const fields: { key: ControlKey; label: string; options: { value: number; label: string }[] }[] = [
    {
      key: "slideCount",
      label: t("slideCount.label"),
      options: SLIDE_COUNT_VALUES.map((n) => ({
        value: n,
        label: n === 0 ? t("slideCount.auto") : String(n),
      })),
    },
    {
      key: "language",
      label: t("language.label"),
      options: Object.values(PresentationLanguage).map((v) => ({
        value: v,
        label: t(`language.items.${LANGUAGE_KEY[v]}`),
      })),
    },
    {
      key: "aspectRatio",
      label: t("aspectRatio.label"),
      options: Object.values(AspectRatio).map((v) => ({
        value: v,
        label: t(`aspectRatio.items.${ASPECT_RATIO_KEY[v]}`),
      })),
    },
    {
      key: "audience",
      label: t("audience.label"),
      options: Object.values(PresentationAudience).map((v) => ({
        value: v,
        label: t(`audience.items.${AUDIENCE_KEY[v]}`),
      })),
    },
    {
      key: "scenario",
      label: t("scenario.label"),
      options: Object.values(PresentationScenario).map((v) => ({
        value: v,
        label: t(`scenario.items.${SCENARIO_KEY[v]}`),
      })),
    },
  ];

  return (
    <div className="app-presentations-outline-hero-controls flex flex-wrap items-center gap-1.5">
      {fields.map((field) => (
        <Select
          key={field.key}
          value={String(value[field.key])}
          onValueChange={(v) => onChange(field.key, Number(v))}
        >
          <SelectTrigger size="sm" className="h-7 shrink-0 gap-1 text-xs">
            <span className="shrink-0 text-muted-foreground">{field.label}:</span>
            <SelectValue>
              {(v: string | null) =>
                field.options.find((option) => String(option.value) === v)?.label ??
                field.options[0]?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
