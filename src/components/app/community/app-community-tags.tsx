"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export function AppCommunityTags({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("app.community.toolbar");
  const tags = t.raw("tags") as string[];
  const [active, setActive] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "app-community-tags -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    >
      <div className="app-community-tags-list flex w-max gap-1.5 pb-0.5">
        {tags.map((tag, i) => {
          const isAll = i === 0;
          const isActive = isAll ? active === null : active === tag;

          return (
            <button
              key={tag}
              onClick={() => setActive(isAll ? null : tag)}
              className={cn(
                "app-community-tag shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
