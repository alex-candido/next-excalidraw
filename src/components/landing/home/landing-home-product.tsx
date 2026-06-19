import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Skeleton } from "@/components/ui/skeleton";
import { H2, Lead, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingHomeProduct({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.home.product");

  return (
    <LayoutSection id="product">
      <LayoutContainer>
        <div className={cn("landing-home-product w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-home-product-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-home-product-preview w-full max-w-4xl">
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>

          <ul className="landing-home-product-features flex flex-wrap items-center justify-center gap-3">
            <li><Small>{t("features.slides")}</Small></li>
            <li><Small>{t("features.canvas")}</Small></li>
            <li><Small>{t("features.export")}</Small></li>
          </ul>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
