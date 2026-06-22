import { AppDashboardHero } from "@/components/app/dashboard/hero/app-dashboard-hero";
import { AppDashboardForm } from "@/components/app/dashboard/form/app-dashboard-form";
import { AppDashboardSuggestions } from "@/components/app/dashboard/suggestions/app-dashboard-suggestions";
import { AppDashboardRecents } from "@/components/app/dashboard/recents/app-dashboard-recents";

export default function AppDashboardPage() {
  return (
    <div className="app-dashboard-page">
      <AppDashboardHero />
      <AppDashboardForm />
      <AppDashboardSuggestions />
      <AppDashboardRecents />
    </div>
  );
}
