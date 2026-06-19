import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Skeleton } from "@/components/ui/skeleton";
import { H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingProductSingleVersions({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.product.single.versions");

  return (
    <LayoutSection id="versions">
      <LayoutContainer>
        <div className={cn("landing-product-single-versions w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-product-single-versions-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-product-single-versions-preview w-full max-w-4xl flex flex-col gap-3">
            <Skeleton className="w-full h-80 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
