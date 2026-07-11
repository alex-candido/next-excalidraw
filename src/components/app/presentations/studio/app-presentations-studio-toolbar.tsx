import { AppPresentationsStudioActions } from "@/components/app/presentations/studio/app-presentations-studio-actions";

export function AppPresentationsStudioToolbar() {
  return (
    <div className="app-presentations-studio-toolbar flex h-11 shrink-0 items-center justify-end border-b px-4">
      <AppPresentationsStudioActions />
    </div>
  );
}
