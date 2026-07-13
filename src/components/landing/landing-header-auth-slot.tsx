"use client";

import { Bell, CreditCard, User, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LayoutNavCtaMenu } from "@/components/layouts/layout-nav-cta-menu";
import { LayoutNavUserMenu } from "@/components/layouts/layout-nav-user-menu";
import { UserMenu } from "@/components/ui/user-menu";
import { useAuth } from "@/hooks/use-auth";

interface LandingHeaderAuthSlotProps {
  cta: ReactNode;
}

export function LandingHeaderAuthSlot({ cta }: LandingHeaderAuthSlotProps) {
  const tUserMenu = useTranslations("common.userMenu");
  const { session } = useAuth();

  if (session.data) {
    return (
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
    );
  }

  return <LayoutNavCtaMenu>{cta}</LayoutNavCtaMenu>;
}
