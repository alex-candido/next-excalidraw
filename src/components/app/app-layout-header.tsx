import { Bell, CreditCard, User, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutNavActions } from "@/components/layouts/layout-nav-actions";
import { LayoutNavBrand } from "@/components/layouts/layout-nav-brand";
import { LayoutNavEnd } from "@/components/layouts/layout-nav-end";
import { LayoutNavUserMenu } from "@/components/layouts/layout-nav-user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { AppNavBrand } from "@/components/app/app-nav-brand";
import { LayoutNavStart } from "@/components/layouts/layout-nav-start";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { UserMenu } from "@/components/ui/user-menu";

export function AppLayoutHeader() {
  const t = useTranslations("app.nav");
  const tUserMenu = useTranslations("common.userMenu");

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
            <LayoutNavUserMenu>
              <UserMenu
                upgradeHref="/app/settings/billing"
                actions={[
                  { key: "billing", label: tUserMenu("billing"), icon: <CreditCard className="size-4" />, href: "/app/settings/billing" },
                  { key: "profile", label: tUserMenu("profile"), icon: <User className="size-4" />, href: "/app/settings/profile" },
                  { key: "account", label: tUserMenu("account"), icon: <UserCog className="size-4" />, href: "/app/settings/account" },
                  { key: "notifications", label: tUserMenu("notifications"), icon: <Bell className="size-4" />, href: "/app/settings/notifications" },
                ]}
              />
            </LayoutNavUserMenu>
          </LayoutNavActions>
        </LayoutNavEnd>
      </LayoutContainer>
    </LayoutHeader>
  );
}
