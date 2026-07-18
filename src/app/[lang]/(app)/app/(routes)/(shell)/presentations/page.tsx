import { AppPresentationsHero } from "@/components/app/presentations/app-presentations-hero";
import { AppPresentations } from "@/components/app/presentations/app-presentations";
import { AppPresentationsFilters } from "@/components/app/presentations/app-presentations-filters";
import { AppPresentationsStats } from "@/components/app/presentations/stats/app-presentations-stats";

export default function PresentationsPage() {
  return (
    <div className="app-presentations-page">
      <AppPresentationsHero />
      <AppPresentationsStats />
      <AppPresentationsFilters />
      <AppPresentations />
    </div>
  );
}
