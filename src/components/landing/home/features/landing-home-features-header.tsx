import { H2, Lead } from "@/components/ui/typography";

export function LandingHomeFeaturesHeader() {
  return (
    <div className="landing-home-features-header flex flex-col items-center text-center gap-3">
      <H2>Everything you need to present better</H2>
      <Lead className="max-w-xl">
        Built for teams that think visually and move fast.
      </Lead>
    </div>
  );
}
