import { AppPresentationsStudioCanvas } from "@/components/app/presentations/studio/app-presentations-studio-canvas";
import { AppPresentationsStudioSlideList } from "@/components/app/presentations/studio/app-presentations-studio-slide-list";

export default function StudioPage() {
  return (
    <div className="app-presentations-studio-page flex gap-3 overflow-hidden bg-muted p-3">
      <AppPresentationsStudioSlideList />
      <AppPresentationsStudioCanvas />
    </div>
  );
}
