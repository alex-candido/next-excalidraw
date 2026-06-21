"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Home, GalleryVerticalEnd, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { key: "home", icon: Home, segment: "" },
  { key: "presentations", icon: GalleryVerticalEnd, segment: "presentations" },
  { key: "settings", icon: Settings, segment: "settings" },
] as const;

export function AppNavMenu() {
  const { lang } = useParams<{ lang: string }>();
  const pathname = usePathname();
  const t = useTranslations("app.nav");

  return (
    <SidebarMenu>
      {NAV_ITEMS.map((item) => {
        const href = `/${lang}/app${item.segment ? `/${item.segment}` : ""}`;
        const isActive =
          item.segment === ""
            ? pathname === `/${lang}/app`
            : pathname.startsWith(`/${lang}/app/${item.segment}`);

        return (
          <SidebarMenuItem key={item.key}>
            <SidebarMenuButton
              render={<Link href={href} />}
              isActive={isActive}
              tooltip={t(item.key)}
            >
              <item.icon />
              <span>{t(item.key)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
