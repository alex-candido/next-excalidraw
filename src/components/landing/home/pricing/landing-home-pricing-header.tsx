import { H2, Lead } from "@/components/ui/typography";

export function LandingHomePricingHeader() {
  return (
    <div className="landing-home-pricing-header flex flex-col items-center text-center gap-3">
      <H2>Simple, transparent pricing</H2>
      <Lead className="max-w-xl">
        Start for free. Upgrade when you need more.
      </Lead>
    </div>
  );
}
