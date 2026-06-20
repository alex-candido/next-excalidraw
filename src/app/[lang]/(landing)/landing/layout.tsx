import { LandingLayoutHeader } from "@/components/landing/landing-layout-header";
import { LandingLayoutFooter } from "@/components/landing/landing-layout-footer";
import { LayoutApp } from "@/components/layouts/layout-app";
import { LayoutMain } from "@/components/layouts/layout-main";
import { LayoutWrapper } from "@/components/layouts/layout-wrapper";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutApp id="landing">
      <LayoutWrapper>
        <LandingLayoutHeader />
        <LayoutMain>{children}</LayoutMain>
        <LandingLayoutFooter />
      </LayoutWrapper>
    </LayoutApp>
  )
}
