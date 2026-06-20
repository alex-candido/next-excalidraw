import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

function BlogPostContentEmpty({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="landing-resources-blog-post-content-empty flex flex-col items-center justify-center gap-2 py-24 text-center">
      <Muted className="text-base font-medium text-foreground">{title}</Muted>
      <Muted>{description}</Muted>
    </div>
  );
}

export async function LandingResourcesBlogPostContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.resources.blog.post.content");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-resources-blog-post-content w-full max-w-3xl mx-auto",
            className,
          )}
          {...props}
        >
          <BlogPostContentEmpty
            title={t("empty.title")}
            description={t("empty.description")}
          />
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
