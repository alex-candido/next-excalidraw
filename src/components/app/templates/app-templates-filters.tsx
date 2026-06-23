"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const FILTER_KEYS = ["all", "official", "recent"] as const;

export function AppTemplatesFilters({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("app.templates.toolbar.filters");

  return (
    <div className={cn("app-templates-filters", className)} {...props}>
      <Tabs defaultValue="all">
        <TabsList className="app-templates-filters-list">
          {FILTER_KEYS.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="app-templates-filters-trigger"
            >
              {t(key)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
