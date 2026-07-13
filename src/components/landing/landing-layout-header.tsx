import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutNavActions } from "@/components/layouts/layout-nav-actions";
import { LayoutNavBrand } from "@/components/layouts/layout-nav-brand";
import { LayoutNavEnd } from "@/components/layouts/layout-nav-end";
import { LayoutNavMenu } from "@/components/layouts/layout-nav-menu";
import { LayoutNavMenuMobile } from "@/components/layouts/layout-nav-menu-mobile";
import { LayoutNavStart } from "@/components/layouts/layout-nav-start";

import { LandingHeaderAuthSlot } from "@/components/landing/landing-header-auth-slot";
import { LandingNavBrand } from "@/components/landing/landing-nav-brand";
import { LandingNavCta } from "@/components/landing/landing-nav-cta";
import { LandingNavMenu } from "@/components/landing/landing-nav-menu";
import { LandingNavMobile } from "@/components/landing/landing-nav-mobile";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingLayoutHeader() {
  return (
    <LayoutHeader>
      <LayoutContainer>
        <LayoutNavBrand>
          <LandingNavBrand />
        </LayoutNavBrand>
        <LayoutNavStart>
          <LayoutNavMenu>
            <LandingNavMenu />
          </LayoutNavMenu>
        </LayoutNavStart>
        <LayoutNavEnd>
          <LayoutNavActions>
            <ThemeToggle />
            <LanguageSwitcher />
            <LandingHeaderAuthSlot cta={<LandingNavCta />} />
          </LayoutNavActions>
          <LayoutNavMenuMobile>
            <LandingNavMobile />
          </LayoutNavMenuMobile>
        </LayoutNavEnd>
      </LayoutContainer>
    </LayoutHeader>
  );
}
