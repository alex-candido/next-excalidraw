import { AppPresentationsHero } from "@/components/app/presentations/app-presentations-hero";
import { AppPresentations } from "@/components/app/presentations/app-presentations";

export default function PresentationsPage() {
  return (
    <div className="app-presentations-page">
      <AppPresentationsHero />
      <AppPresentations />
    </div>
  );
}
