import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { H2, Muted, P } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingInstitutionalAboutStory({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.institutional.about.story");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-institutional-about-story w-full max-w-3xl mx-auto flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <Muted className="uppercase tracking-widest text-xs font-semibold">
            {t("label")}
          </Muted>
          <H2 className="landing-institutional-about-story-title border-none">
            {t("title")}
          </H2>
          <P className="landing-institutional-about-story-description text-muted-foreground">
            {t("description")}
          </P>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
