import { AppPresentationsStudioHeader } from "@/components/app/presentations/studio/app-presentations-studio-header";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper className="h-screen overflow-hidden">
      <AppPresentationsStudioHeader />
      <LayoutMain>
        {children}
      </LayoutMain>
    </LayoutWrapper>
  );
}
