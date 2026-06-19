import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Button } from "@/components/ui/button";
import { H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingProductMultiCta({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.product.multi.cta");

  return (
    <LayoutSection id="cta">
      <LayoutContainer>
        <div className={cn("landing-product-multi-cta w-full flex flex-col items-center gap-8", className)} {...props}>
          <div className="landing-product-multi-cta-heading flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-product-multi-cta-actions flex items-center gap-4">
            <Button size="lg" render={<Link href="/auth/sign-up" />} nativeButton={false}>
              {t("start")}
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/landing/product/single" />} nativeButton={false}>
              {t("seeSingle")}
            </Button>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
