import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H1, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingProductMultiHero({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.product.multi.hero");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div className={cn("landing-product-multi-hero w-full flex flex-col items-center text-center gap-6", className)} {...props}>
          <div className="landing-product-multi-hero-badge">
            <Badge variant="secondary">{t("badge")}</Badge>
          </div>

          <H1 className="landing-product-multi-hero-title max-w-3xl">{t("title")}</H1>

          <Lead className="landing-product-multi-hero-description max-w-xl">{t("description")}</Lead>

          <div className="landing-product-multi-hero-actions flex items-center gap-4">
            <Button size="lg" render={<Link href="/auth/sign-up" />} nativeButton={false}>
              {t("start")}
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/landing/home#demo" />} nativeButton={false}>
              {t("demo")}
            </Button>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
