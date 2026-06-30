import { AppLayoutFooter } from "@/components/app/app-layout-footer";
import { AppPresentationsOutlineHeader } from "@/components/app/presentations/outline/app-presentations-outline-header";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";

export default function OutlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper>
      <AppPresentationsOutlineHeader />
      <LayoutMain className="pb-20 md:pb-0">
        {children}
      </LayoutMain>
      <AppLayoutFooter />
    </LayoutWrapper>
  );
}
