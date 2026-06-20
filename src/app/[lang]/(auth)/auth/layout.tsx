import { AuthLayoutHeader } from "@/components/auth/auth-layout-header";
import { LayoutApp } from "@/components/layouts/layout-app";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutApp id="auth">
      <LayoutWrapper>
        <AuthLayoutHeader />
        <LayoutMain>{children}</LayoutMain>
      </LayoutWrapper>
    </LayoutApp>
  );
}
