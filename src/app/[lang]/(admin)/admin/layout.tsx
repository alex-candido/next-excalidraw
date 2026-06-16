import { LayoutApp } from "@/components/layouts/layout-app";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutMain } from "@/components/layouts/layout-main";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AdminProviders } from "@/providers/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <LayoutApp id="admin">
        <div className="layout-wrapper">
          <LayoutHeader>
            <ThemeToggle />
          </LayoutHeader>
          <LayoutMain>{children}</LayoutMain>
        </div>
      </LayoutApp>
    </AdminProviders>
  );
}
