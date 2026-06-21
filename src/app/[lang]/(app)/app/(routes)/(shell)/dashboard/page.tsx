import { AppDashboardHero } from "@/components/app/dashboard/app-dashboard-hero";
import { AppDashboardForm } from "@/components/app/dashboard/app-dashboard-form";
import { AppDashboardSuggestions } from "@/components/app/dashboard/app-dashboard-suggestions";
import { AppDashboardRecents } from "@/components/app/dashboard/app-dashboard-recents";

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
