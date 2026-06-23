"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const FILTER_KEYS = ["all", "recent", "mine", "favorites"] as const;

export function AppPresentationsFilters({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("app.presentations.toolbar.filters");

  return (
    <div
      className={cn("app-presentations-filters", className)}
      {...props}
    >
      <Tabs defaultValue="all">
        <TabsList className="app-presentations-filters-list">
          {FILTER_KEYS.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="app-presentations-filters-trigger"
            >
              {t(key)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
