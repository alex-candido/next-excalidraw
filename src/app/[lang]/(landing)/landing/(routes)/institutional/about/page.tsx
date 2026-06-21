import { LandingInstitutionalAboutHero } from "@/components/landing/institutional/about/landing-institutional-about-hero";
import { LandingInstitutionalAboutMission } from "@/components/landing/institutional/about/landing-institutional-about-mission";
import { LandingInstitutionalAboutStory } from "@/components/landing/institutional/about/landing-institutional-about-story";

export default function AboutPage() {
  return (
    <div className="landing-institutional-about-page">
      <LandingInstitutionalAboutHero />
      <LandingInstitutionalAboutMission />
      <LandingInstitutionalAboutStory />
    </div>
  );
}
