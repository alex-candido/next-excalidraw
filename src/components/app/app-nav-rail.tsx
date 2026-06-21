"use client";

import { GalleryVerticalEnd, Home, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "home", icon: Home, href: "/app" },
  { key: "presentations", icon: GalleryVerticalEnd, href: "/app/presentations" },
  { key: "settings", icon: Settings, href: "/app/settings" },
] as const;

export function AppNavRail() {
  const pathname = usePathname();
  const t = useTranslations("app.nav");

  return (
    <nav className="app-nav-rail flex flex-col gap-1 rounded-2xl border bg-card p-1.5 shadow-lg drop-shadow-sm">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-label={t(item.key)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-2 py-4 transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-4" />
            <span className="text-[10px] leading-none font-medium">{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
