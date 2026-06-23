"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const FILTER_KEYS = ["all", "recent", "popular", "following"] as const;

export function AppCommunityFilters({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("app.community.toolbar.filters");

  return (
    <div className={cn("app-community-filters", className)} {...props}>
      <Tabs defaultValue="all">
        <TabsList className="app-community-filters-list">
          {FILTER_KEYS.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="app-community-filters-trigger"
            >
              {t(key)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
