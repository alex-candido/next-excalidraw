import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { H1, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingInstitutionalAboutHero({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.institutional.about.hero");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-institutional-about-hero w-full max-w-3xl mx-auto flex flex-col items-center text-center gap-4",
            className,
          )}
          {...props}
        >
          <Badge variant="secondary" className="rounded-full">
            {t("badge")}
          </Badge>
          <H1 className="landing-institutional-about-hero-title max-w-2xl">
            {t("title")}
          </H1>
          <Lead className="landing-institutional-about-hero-description max-w-xl">
            {t("description")}
          </Lead>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
