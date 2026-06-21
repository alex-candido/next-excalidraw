import { LandingTransparencyTermsContent } from "@/components/landing/transparency/terms/landing-transparency-terms-content";
import { LandingTransparencyTermsHero } from "@/components/landing/transparency/terms/landing-transparency-terms-hero";

export default function TermsPage() {
  return (
    <div className="landing-transparency-legal-terms-page">
      <LandingTransparencyTermsHero />
      <LandingTransparencyTermsContent />
    </div>
  );
}
