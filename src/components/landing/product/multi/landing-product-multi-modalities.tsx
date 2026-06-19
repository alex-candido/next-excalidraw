import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingProductMultiModalities({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.product.multi.modalities");

  return (
    <LayoutSection id="modalities">
      <LayoutContainer>
        <div className={cn("landing-product-multi-modalities w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-product-multi-modalities-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-product-multi-modalities-grid w-full grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            {(["multi", "single"] as const).map((key) => (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{t(`items.${key}.label`)}</Badge>
                    <Badge variant={key === "multi" ? "default" : "secondary"}>{t(`items.${key}.tag`)}</Badge>
                  </div>
                  <CardTitle>{t(`items.${key}.title`)}</CardTitle>
                  <CardDescription>{t(`items.${key}.description`)}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
