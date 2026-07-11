import { AppPresentationsStudioCanvas } from "@/components/app/presentations/studio/app-presentations-studio-canvas";
import {
  AppPresentationsStudioSlideList,
  AppPresentationsStudioSlideListMobile,
} from "@/components/app/presentations/studio/app-presentations-studio-slide-list";
import { AppPresentationsStudioPanel } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel";

export default function StudioPage() {
  return (
    <div className="app-presentations-studio-page grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-1 md:gap-3 overflow-hidden bg-muted p-1 md:p-3 md:flex md:flex-row">
      <AppPresentationsStudioSlideList />
      <AppPresentationsStudioCanvas />
      <AppPresentationsStudioPanel />
      <AppPresentationsStudioSlideListMobile />
    </div>
  );
}
