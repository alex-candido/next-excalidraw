import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { cn } from "@/lib/utils";

import { LandingHomeFaqHeader } from "./landing-home-faq-header";
import { LandingHomeFaqList } from "./landing-home-faq-list";

export function LandingHomeFaq({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LayoutSection id="faq">
      <LayoutContainer>
        <div className={cn("landing-home-faq w-full flex flex-col items-center gap-10", className)} {...props}>
          <LandingHomeFaqHeader />
          <LandingHomeFaqList />
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
