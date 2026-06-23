import { AppCommunityHero } from "@/components/app/community/app-community-hero";
import { AppCommunity } from "@/components/app/community/app-community";

export default function CommunityPage() {
  return (
    <div className="app-community-page">
      <AppCommunityHero />
      <AppCommunity />
    </div>
  );
}
