import { LandingInstitutionalContactHero } from "@/components/landing/institutional/contact/landing-institutional-contact-hero";
import { LandingInstitutionalContactInfo } from "@/components/landing/institutional/contact/landing-institutional-contact-info";

export default function ContactPage() {
  return (
    <div className="landing-institutional-contact-page">
      <LandingInstitutionalContactHero />
      <LandingInstitutionalContactInfo />
    </div>
  );
}
