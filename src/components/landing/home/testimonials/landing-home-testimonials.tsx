import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { cn } from "@/lib/utils";

import { LandingHomeTestimonialsGrid } from "./landing-home-testimonials-grid";
import { LandingHomeTestimonialsHeader } from "./landing-home-testimonials-header";

export function LandingHomeTestimonials({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LayoutSection id="testimonials">
      <LayoutContainer>
        <div className={cn("landing-home-testimonials w-full flex flex-col items-center gap-10", className)} {...props}>
          <LandingHomeTestimonialsHeader />
          <LandingHomeTestimonialsGrid />
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
