import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { cn } from "@/lib/utils";

import { LandingHomePricingHeader } from "./landing-home-pricing-header";
import { LandingHomePricingPlans } from "./landing-home-pricing-plans";

export function LandingHomePricing({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LayoutSection id="pricing">
      <LayoutContainer>
        <div className={cn("landing-home-pricing w-full flex flex-col items-center gap-10", className)} {...props}>
          <LandingHomePricingHeader />
          <LandingHomePricingPlans />
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
