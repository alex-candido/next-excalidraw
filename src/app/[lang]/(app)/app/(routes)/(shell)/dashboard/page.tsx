import { AppDashboardHero } from "@/components/app/dashboard/hero/app-dashboard-hero";
import { AppDashboardForm } from "@/components/app/dashboard/form/app-dashboard-form";
import { AppDashboardSuggestions } from "@/components/app/dashboard/suggestions/app-dashboard-suggestions";
import { AppDashboardRecents } from "@/components/app/dashboard/recents/app-dashboard-recents";
import { AppDashboardTemplates } from "@/components/app/dashboard/templates/app-dashboard-templates";
import { AppDashboardCommunity } from "@/components/app/dashboard/community/app-dashboard-community";

export default function AppDashboardPage() {
  return (
    <div className="app-dashboard-page">
      <AppDashboardHero />
      <AppDashboardForm />
      <AppDashboardSuggestions />
      <AppDashboardRecents />
      <AppDashboardTemplates />
      <AppDashboardCommunity />
    </div>
  );
}
