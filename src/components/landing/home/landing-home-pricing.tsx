import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingHomePricing({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.home.pricing");

  return (
    <LayoutSection id="pricing">
      <LayoutContainer>
        <div className={cn("landing-home-pricing w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-home-pricing-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-home-pricing-plans w-full grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>{t("free.title")}</CardTitle>
                <CardDescription>{t("free.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" render={<Link href="/auth/sign-up" />} nativeButton={false}>
                  {t("free.cta")}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("pro.title")}</CardTitle>
                <CardDescription>{t("pro.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" render={<Link href="/auth/sign-up" />} nativeButton={false}>
                  {t("pro.cta")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
