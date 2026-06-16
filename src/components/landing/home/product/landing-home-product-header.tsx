import { H2, Lead } from "@/components/ui/typography";

export function LandingHomeProductHeader() {
  return (
    <div className="landing-home-product-header flex flex-col items-center text-center gap-3">
      <H2>See it in action</H2>
      <Lead className="max-w-xl">
        From a simple prompt to a complete visual presentation in seconds.
      </Lead>
    </div>
  );
}
