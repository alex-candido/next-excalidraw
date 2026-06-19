"use client";

import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type Category = "all" | "updates" | "tutorials" | "useCases";

const CATEGORIES: Category[] = ["all", "updates", "tutorials", "useCases"];

function BlogEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="landing-resources-blog-empty flex flex-col items-center justify-center gap-2 py-24 text-center">
      <Muted className="text-base font-medium text-foreground">{title}</Muted>
      <Muted>{description}</Muted>
    </div>
  );
}

export function LandingResourcesBlogFeed({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("landing.resources.blog");

  return (
    <LayoutSection>
      <LayoutContainer className={cn("flex-col gap-8", className)} {...props}>
        <Tabs defaultValue="all" className="landing-resources-blog-feed w-full max-w-3xl mx-auto">
          <TabsList variant="line" className="landing-resources-blog-tabs">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {t(`categories.${cat}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <BlogEmptyState
                title={t("empty.title")}
                description={t("empty.description")}
              />
            </TabsContent>
          ))}
        </Tabs>
      </LayoutContainer>
    </LayoutSection>
  );
}
