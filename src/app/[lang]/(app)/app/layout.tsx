import { LayoutApp } from "@/components/layouts/layout-app";
import { AppProviders } from "@/providers/app";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <LayoutApp id="app">{children}</LayoutApp>
    </AppProviders>
  );
}
