import { LayoutApp } from "@/components/layouts/layout-app";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutApp id="auth">
      <LayoutWrapper>
        <LayoutHeader>
          <ThemeToggle />
        </LayoutHeader>
        <LayoutMain>{children}</LayoutMain>
      </LayoutWrapper>
    </LayoutApp>
  );
}
