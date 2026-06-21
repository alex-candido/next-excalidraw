import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { H1, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingInstitutionalTeamHero({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.institutional.team.hero");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-institutional-team-hero w-full max-w-3xl mx-auto flex flex-col items-center text-center gap-4",
            className,
          )}
          {...props}
        >
          <Badge variant="secondary" className="rounded-full">
            {t("badge")}
          </Badge>
          <H1 className="landing-institutional-team-hero-title max-w-2xl">
            {t("title")}
          </H1>
          <Lead className="landing-institutional-team-hero-description max-w-xl">
            {t("description")}
          </Lead>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
