import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";

import { LandingHomeHeroActions } from "@/components/landing/home/hero/landing-home-hero-actions";
import { LandingHomeHeroAnnouncement } from "@/components/landing/home/hero/landing-home-hero-announcement";
import { LandingHomeHeroDescription } from "@/components/landing/home/hero/landing-home-hero-description";
import { LandingHomeHeroSocialProof } from "@/components/landing/home/hero/landing-home-hero-social-proof";
import { LandingHomeHeroTitle } from "@/components/landing/home/hero/landing-home-hero-title";

import { cn } from "@/lib/utils";

export function LandingHomeHero({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div className={cn("landing-home-hero w-full flex flex-col items-center text-center gap-6", className)} {...props}>
          <LandingHomeHeroAnnouncement />
          <LandingHomeHeroTitle />
          <LandingHomeHeroDescription />
          <LandingHomeHeroActions />
          <LandingHomeHeroSocialProof />
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
