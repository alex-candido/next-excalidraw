import { AppNavBrand } from "@/components/app/app-nav-brand";
import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutNavActions } from "@/components/layouts/layout-nav-actions";
import { LayoutNavBrand } from "@/components/layouts/layout-nav-brand";
import { LayoutNavEnd } from "@/components/layouts/layout-nav-end";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AppPresentationsStudioHeader() {
  return (
    <LayoutHeader>
      <LayoutContainer className="md:max-w-full!">
        <LayoutNavBrand>
          <AppNavBrand />
        </LayoutNavBrand>
        <LayoutNavEnd>
          <LayoutNavActions>
            <ThemeToggle />
            <LanguageSwitcher />
          </LayoutNavActions>
        </LayoutNavEnd>
      </LayoutContainer>
    </LayoutHeader>
  );
}
