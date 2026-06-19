import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingHomeFeatures({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.home.features");

  return (
    <LayoutSection id="features">
      <LayoutContainer>
        <div className={cn("landing-home-features w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-home-features-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-home-features-grid w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("items.ai.title")}</CardTitle>
                <CardDescription>{t("items.ai.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("items.canvas.title")}</CardTitle>
                <CardDescription>{t("items.canvas.description")}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("items.multilang.title")}</CardTitle>
                <CardDescription>{t("items.multilang.description")}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
