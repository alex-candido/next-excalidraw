import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingProductMultiAudience({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.product.multi.audience");

  return (
    <LayoutSection id="audience">
      <LayoutContainer>
        <div className={cn("landing-product-multi-audience w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-product-multi-audience-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-product-multi-audience-grid w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["educators", "engineers", "managers"] as const).map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{t(`profiles.${key}.role`)}</CardTitle>
                  <CardTitle>{t(`profiles.${key}.title`)}</CardTitle>
                  <CardDescription>{t(`profiles.${key}.description`)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
