import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingProductMultiHowItWorks({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.product.multi.howItWorks");

  return (
    <LayoutSection id="how-it-works">
      <LayoutContainer>
        <div className={cn("landing-product-multi-how-it-works w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-product-multi-how-it-works-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-product-multi-how-it-works-steps w-full grid grid-cols-1 md:grid-cols-4 gap-6">
            {(["describe", "outline", "create", "share"] as const).map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-muted-foreground text-sm font-mono">{t(`steps.${key}.step`)}</CardTitle>
                  <CardTitle>{t(`steps.${key}.title`)}</CardTitle>
                  <CardDescription>{t(`steps.${key}.description`)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
