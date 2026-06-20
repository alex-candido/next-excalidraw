import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { H1, Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLElement> & {
  category: string
  title: string
  date: string
  readTime: string
}

export async function LandingResourcesBlogPostHero({
  category,
  title,
  date,
  readTime,
  className,
  ...props
}: Props) {
  const t = await getTranslations("landing.resources.blog.post");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-resources-blog-post-hero w-full max-w-3xl mx-auto flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <Link
            href="/landing/resources/blog"
            className="landing-resources-blog-post-hero-back inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ChevronLeft className="size-4" />
            {t("back")}
          </Link>

          <Badge variant="secondary" className="rounded-full w-fit">
            {category}
          </Badge>

          <H1 className="landing-resources-blog-post-hero-title">
            {title}
          </H1>

          <Muted className="landing-resources-blog-post-hero-meta flex items-center gap-2">
            <span>{date}</span>
            <span aria-hidden>·</span>
            <span>{t("readTime", { minutes: readTime })}</span>
          </Muted>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
