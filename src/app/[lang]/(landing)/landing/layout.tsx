import { LandingLayoutHeader } from "@/components/landing/landing-layout-header";
import { LandingLayoutFooter } from "@/components/landing/landing-layout-footer";
import { LayoutApp } from "@/components/layouts/layout-app";
import { LayoutMain } from "@/components/layouts/layout-main";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutApp id="landing">
      <LandingLayoutHeader />
      <LayoutMain>{children}</LayoutMain>
      <LandingLayoutFooter />
    </LayoutApp>
  )
}
