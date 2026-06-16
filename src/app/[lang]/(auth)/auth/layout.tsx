import { LayoutApp } from "@/components/layouts/layout-app";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutMain } from "@/components/layouts/layout-main";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutApp id="auth">
      <div className="layout-wrapper">
        <LayoutHeader>
          <ThemeToggle />
        </LayoutHeader>
        <LayoutMain>{children}</LayoutMain>
      </div>
    </LayoutApp>
  );
}
