"use client";

import { FileStack, Layers, Presentation, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { useAppMetrics } from "@/hooks/app/use-app-metrics";
import { cn } from "@/lib/utils";

import { AppPresentationsStatCard } from "@/components/app/presentations/stats/app-presentations-stat-card";
import { AppPresentationsStatCardSkeleton } from "@/components/app/presentations/stats/app-presentations-stat-card-skeleton";

const SKELETON_COUNT = 4;

export function AppPresentationsStats({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.presentations.stats");
  const { useOverview } = useAppMetrics();
  const { data: metrics, isLoading } = useOverview();

  return (
    <LayoutSection className="pb-6! pt-0!">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-presentations-stats flex w-full max-w-4xl flex-row items-stretch gap-2 sm:gap-3",
            className,
          )}
          {...props}
        >
          {isLoading || !metrics ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <AppPresentationsStatCardSkeleton key={i} />
            ))
          ) : (
            <>
              <AppPresentationsStatCard
                icon={Presentation}
                label={t("total.label")}
                value={String(metrics.presentations.total)}
              />
              <AppPresentationsStatCard
                icon={Layers}
                label={t("multi.label")}
                value={String(metrics.presentations.multi)}
              />
              <AppPresentationsStatCard
                icon={FileStack}
                label={t("single.label")}
                value={String(metrics.presentations.single)}
              />
              <AppPresentationsStatCard
                icon={Sparkles}
                label={t("generation.label")}
                value={String(metrics.generation.aiGenerated)}
              />
            </>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
