import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted, H2, Lead } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

function BlogPostSuggestionsEmpty({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="landing-resources-blog-post-suggestions-empty flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Muted className="text-base font-medium text-foreground">{title}</Muted>
      <Muted>{description}</Muted>
    </div>
  );
}

export async function LandingResourcesBlogPostSuggestions({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.resources.blog.post.suggestions");

  return (
    <LayoutSection>
      <LayoutContainer>
        <div
          className={cn(
            "landing-resources-blog-post-suggestions w-full flex flex-col gap-10",
            className,
          )}
          {...props}
        >
          <div className="landing-resources-blog-post-suggestions-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
            <Lead className="max-w-xl">{t("description")}</Lead>
          </div>

          <div className="landing-resources-blog-post-suggestions-grid w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <BlogPostSuggestionsEmpty
              title={t("empty.title")}
              description={t("empty.description")}
            />
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
