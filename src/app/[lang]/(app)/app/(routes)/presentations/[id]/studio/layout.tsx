import { AppLayoutFooter } from "@/components/app/app-layout-footer";
import { AppPresentationsStudioHeader } from "@/components/app/presentations/studio/app-presentations-studio-header";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper>
      <AppPresentationsStudioHeader />
      <LayoutMain className="pb-20 md:pb-0">
        {children}
      </LayoutMain>
      <AppLayoutFooter />
    </LayoutWrapper>
  );
}
