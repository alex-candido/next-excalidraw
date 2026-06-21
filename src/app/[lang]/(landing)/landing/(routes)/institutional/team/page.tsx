import { LandingInstitutionalTeamHero } from "@/components/landing/institutional/team/landing-institutional-team-hero";
import { LandingInstitutionalTeamMembers } from "@/components/landing/institutional/team/landing-institutional-team-members";

export default function EquipePage() {
  return (
    <div className="landing-institutional-team-page">
      <LandingInstitutionalTeamHero />
      <LandingInstitutionalTeamMembers />
    </div>
  );
}
