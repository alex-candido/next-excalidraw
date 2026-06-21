import { AppLayoutHeader } from "@/components/app/app-layout-header";
import { AppLayoutRail } from "@/components/app/app-layout-rail";
import { AppLayoutShell } from "@/components/app/app-layout-shell";
import { AppNavRail } from "@/components/app/app-nav-rail";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";

export default async function AppShellLayout({
  children
}: {
  children: React.ReactNode;
}) {

  return (
    <LayoutWrapper>
      <AppLayoutHeader />
      <AppLayoutShell>
        <AppLayoutRail>
          <AppNavRail />
        </AppLayoutRail>
        <LayoutMain>{children}</LayoutMain>
      </AppLayoutShell>
    </LayoutWrapper>
  );
}

