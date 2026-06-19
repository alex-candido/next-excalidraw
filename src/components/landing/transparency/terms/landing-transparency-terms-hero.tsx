import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { H1, Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingTransparencyTermsHero({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.transparency.terms.hero");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-transparency-terms-hero w-full max-w-3xl mx-auto flex flex-col gap-3",
            className,
          )}
          {...props}
        >
          <Badge variant="secondary" className="rounded-full w-fit">
            {t("badge")}
          </Badge>
          <H1 className="landing-transparency-terms-hero-title">
            {t("title")}
          </H1>
          <Muted>{t("lastUpdated")}</Muted>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
