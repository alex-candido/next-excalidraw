import { LayoutApp } from "@/components/layouts/layout-app";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AppProviders } from "@/providers/app";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <LayoutApp id="app">
        <LayoutWrapper>
          <LayoutHeader>
            <ThemeToggle />
          </LayoutHeader>
          <LayoutMain>{children}</LayoutMain>
        </LayoutWrapper>
      </LayoutApp>
    </AppProviders>
  );
}
