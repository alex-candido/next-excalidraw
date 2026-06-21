import { Globe, LayoutTemplate, Palette, Sparkles, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { H1, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function AppDashboardHero({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.dashboard.hero");

  const features = [
    { key: "languages", icon: Globe },
    { key: "ratios", icon: LayoutTemplate },
    { key: "audiences", icon: Users },
    { key: "themes", icon: Palette },
  ] as const;

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-dashboard-hero w-full max-w-3xl flex flex-col items-center text-center gap-4",
            className,
          )}
          {...props}
        >
          <Badge variant="secondary" className="app-dashboard-hero-tagline gap-2 rounded-full px-4 py-3.5 font-normal">
            <Sparkles className="size-3.5" />
            {t("tagline")}
          </Badge>
          <H1 className="app-dashboard-hero-title">{t("title")}</H1>
          <Lead className="app-dashboard-hero-description max-w-lg">
            {t("description")}
          </Lead>
          <div className="app-dashboard-hero-features flex flex-wrap items-center justify-center gap-2">
            {features.map(({ key, icon: Icon }) => (
              <Badge
                key={key}
                variant="secondary"
                className="app-dashboard-hero-feature-badge rounded-full gap-2 font-normal px-4 py-3.5 text-sm"
              >
                <Icon className="size-3.5" />
                {t(`features.${key}`)}
              </Badge>
            ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
