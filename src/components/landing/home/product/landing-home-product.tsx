import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { cn } from "@/lib/utils";

import { LandingHomeProductFeatures } from "./landing-home-product-features";
import { LandingHomeProductHeader } from "./landing-home-product-header";
import { LandingHomeProductPreview } from "./landing-home-product-preview";

export function LandingHomeProduct({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LayoutSection id="product">
      <LayoutContainer>
        <div className={cn("landing-home-product w-full flex flex-col items-center gap-10", className)} {...props}>
          <LandingHomeProductHeader />
          <LandingHomeProductPreview />
          <LandingHomeProductFeatures />
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
