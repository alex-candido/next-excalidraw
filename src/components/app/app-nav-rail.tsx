"use client";

import { GalleryVerticalEnd, Home, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "home", icon: Home, href: "/app/dashboard" },
  { key: "presentations", icon: GalleryVerticalEnd, href: "/app/presentations" },
  { key: "settings", icon: Settings, href: "/app/settings" },
] as const;

export function AppNavRail() {
  const pathname = usePathname();
  const t = useTranslations("app.nav");

  return (
    <TooltipProvider delay={300}>
      <nav className="app-nav-rail flex flex-row gap-1 rounded-2xl border bg-card p-1.5 shadow-sm md:flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Tooltip key={item.key}>
              <TooltipTrigger render={
                <Link
                  href={item.href}
                  aria-label={t(item.key)}
                  className={cn(
                    "flex items-center justify-center rounded-xl p-2.5 h-10 w-10 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                />
              }>
                <item.icon className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right" className="hidden md:flex">{t(item.key)}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
