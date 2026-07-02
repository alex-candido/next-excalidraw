"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { THEME_KEYS } from "@/schemas/app/presentation-schema";

import {
  AMOUNT_KEY,
  ASPECT_RATIO_KEY,
  AUDIENCE_KEY,
  LANGUAGE_KEY,
  SCENARIO_KEY,
  type AppPresentationsOutlineParams,
} from "@/components/app/presentations/outline/outline-enum-labels";

interface AppPresentationsOutlineHeroTagsProps {
  params: AppPresentationsOutlineParams;
}

export function AppPresentationsOutlineHeroTags({ params }: AppPresentationsOutlineHeroTagsProps) {
  const t = useTranslations("app.outline.hero");
  const tp = useTranslations("app.outline.parameters");

  const tags = [
    t(`controls.language.items.${LANGUAGE_KEY[params.language]}`),
    t(`controls.aspectRatio.items.${ASPECT_RATIO_KEY[params.aspectRatio]}`),
    params.slideCount === 0
      ? t("tags.slideCountAuto")
      : t("tags.slideCount", { count: params.slideCount }),
    t(`controls.audience.items.${AUDIENCE_KEY[params.audience]}`),
    t(`controls.scenario.items.${SCENARIO_KEY[params.scenario]}`),
    tp(`amount.items.${AMOUNT_KEY[params.amount]}`),
    tp(`theme.items.${THEME_KEYS[params.theme]}`),
  ];

  return (
    <div className="app-presentations-outline-hero-tags flex flex-wrap gap-1.5">
      {tags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="secondary"
          className="app-presentations-outline-hero-tag rounded-full text-xs font-normal"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
