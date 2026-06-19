import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingProductMultiCapabilities({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.product.multi.capabilities");

  return (
    <LayoutSection id="capabilities">
      <LayoutContainer>
        <div className={cn("landing-product-multi-capabilities w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-product-multi-capabilities-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-product-multi-capabilities-grid w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["languages", "ratios", "themes", "audience", "scenario", "slideCount"] as const).map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{t(`items.${key}.title`)}</CardTitle>
                  <CardDescription>{t(`items.${key}.description`)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
