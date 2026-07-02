import { AppPresentationsOutlineBody } from "@/components/app/presentations/outline/app-presentations-outline-body";
import { AppPresentationsOutlineBottomBar } from "@/components/app/presentations/outline/app-presentations-outline-bottom-bar";
import { AppPresentationsOutlineHero } from "@/components/app/presentations/outline/hero/app-presentations-outline-hero";

export default function OutlinePage() {
  return (
    <div className="app-presentations-outline-page">
      <AppPresentationsOutlineHero />
      <AppPresentationsOutlineBody />
      <AppPresentationsOutlineBottomBar />
    </div>
  );
}
