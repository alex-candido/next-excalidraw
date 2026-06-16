import { H2, Lead } from "@/components/ui/typography";

export function LandingHomeFaqHeader() {
  return (
    <div className="landing-home-faq-header flex flex-col items-center text-center gap-3">
      <H2>Frequently asked questions</H2>
      <Lead className="max-w-xl">
        Everything you need to know before getting started.
      </Lead>
    </div>
  );
}
