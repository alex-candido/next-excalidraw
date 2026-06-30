import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { H1, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function AppPresentationsHero({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.presentations.hero");

  return (
    <LayoutSection className="pb-16! first:pt-6 md:first:pt-16">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-presentations-hero w-full max-w-4xl flex flex-col gap-2",
            className,
          )}
          {...props}
        >
          <H1 className="app-presentations-hero-title">{t("title")}</H1>
          <Lead className="app-presentations-hero-description">
            {t("description")}
          </Lead>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
