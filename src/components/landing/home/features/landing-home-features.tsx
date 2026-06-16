import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { cn } from "@/lib/utils";

import { LandingHomeFeaturesGrid } from "./landing-home-features-grid";
import { LandingHomeFeaturesHeader } from "./landing-home-features-header";

export function LandingHomeFeatures({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LayoutSection id="features">
      <LayoutContainer>
        <div className={cn("landing-home-features w-full flex flex-col items-center gap-10", className)} {...props}>
          <LandingHomeFeaturesHeader />
          <LandingHomeFeaturesGrid />
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
