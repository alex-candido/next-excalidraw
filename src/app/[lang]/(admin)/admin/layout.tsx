import { LayoutApp } from "@/components/layouts/layout-app";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AdminProviders } from "@/providers/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <LayoutApp id="admin">
        <LayoutWrapper>
          <LayoutHeader>
            <ThemeToggle />
          </LayoutHeader>
          <LayoutMain>{children}</LayoutMain>
        </LayoutWrapper>
      </LayoutApp>
    </AdminProviders>
  );
}
