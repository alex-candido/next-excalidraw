import { Muted } from "@/components/ui/typography";

export function LandingHomeHeroSocialProof() {
  return (
    <Muted className="landing-home-hero-social-proof flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
      <span>14-day free trial</span>
      <span aria-hidden className="hidden sm:inline">·</span>
      <span>Join more than 50 organizations teaching with our app</span>
    </Muted>
  );
}
