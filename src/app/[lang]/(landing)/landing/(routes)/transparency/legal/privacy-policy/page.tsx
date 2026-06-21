import { LandingTransparencyPrivacyPolicyContent } from "@/components/landing/transparency/privacy-policy/landing-transparency-privacy-policy-content";
import { LandingTransparencyPrivacyPolicyHero } from "@/components/landing/transparency/privacy-policy/landing-transparency-privacy-policy-hero";

export default function PrivacyPolicyPage() {
  return (
    <div className="landing-transparency-legal-privacy-policy-page">
      <LandingTransparencyPrivacyPolicyHero />
      <LandingTransparencyPrivacyPolicyContent />
    </div>
  );
}
