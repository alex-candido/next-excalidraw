import { AppStartHero } from "@/components/app/start/hero/app-start-hero";
import { AppStartForm } from "@/components/app/start/form/app-start-form";
import { AppStartSuggestions } from "@/components/app/start/suggestions/app-start-suggestions";
import { AppStartRecents } from "@/components/app/start/recents/app-start-recents";
import { AppStartTemplates } from "@/components/app/start/templates/app-start-templates";
import { AppStartCommunity } from "@/components/app/start/community/app-start-community";

export default function AppStartPage() {
  return (
    <div className="app-start-page">
      <AppStartHero />
      <AppStartForm />
      <AppStartSuggestions />
      <AppStartRecents />
      <AppStartTemplates />
      <AppStartCommunity />
    </div>
  );
}
