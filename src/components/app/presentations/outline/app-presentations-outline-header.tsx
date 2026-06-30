import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutNavActions } from "@/components/layouts/layout-nav-actions";
import { LayoutNavBrand } from "@/components/layouts/layout-nav-brand";
import { LayoutNavEnd } from "@/components/layouts/layout-nav-end";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { AppNavBrand } from "@/components/app/app-nav-brand";
import { LayoutNavStart } from "@/components/layouts/layout-nav-start";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function AppPresentationsOutlineHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <LayoutHeader>
      <LayoutContainer>
        <LayoutNavBrand>
          <AppNavBrand />
        </LayoutNavBrand>
        <LayoutNavStart />
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
