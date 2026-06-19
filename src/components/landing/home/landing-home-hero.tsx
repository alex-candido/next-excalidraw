import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H1, Lead, Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingHomeHero({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.home.hero");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-home-hero w-full flex flex-col items-center text-center gap-6",
            className,
          )}
          {...props}
        >
          <Link
            href="/landing/resources/blog"
            className="landing-home-hero-announcement inline-flex max-w-[280px] items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:max-w-none"
          >
            <Badge
              variant="secondary"
              className="shrink-0 rounded-full px-2 py-0 text-xs"
            >
              {t("announcementBadge")}
            </Badge>
            <span className="truncate">{t("announcement")}</span>
            <ArrowRight className="shrink-0 size-3" />
          </Link>

          <H1 className="landing-home-hero-title max-w-3xl">{t("title")}</H1>

          <Lead className="landing-home-hero-description max-w-xl">
            {t("description")}
          </Lead>

          <div className="landing-home-hero-actions flex items-center gap-4">
            <Button
              size="lg"
              render={<Link href="/auth/sign-up" />}
              nativeButton={false}
            >
              {t("cta.start")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/landing/home#demo" />}
              nativeButton={false}
            >
              {t("cta.demo")}
            </Button>
          </div>

          <Muted className="landing-home-hero-social-proof flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
            <span>{t("socialProof")}</span>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span>{t("socialProofJoin")}</span>
          </Muted>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
