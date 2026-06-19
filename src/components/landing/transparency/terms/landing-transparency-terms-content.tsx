import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { H3, P } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingTransparencyTermsContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.transparency.terms.sections");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-transparency-terms-content w-full max-w-3xl mx-auto flex flex-col gap-10",
            className,
          )}
          {...props}
        >
          <div className="flex flex-col gap-3">
            <H3>{t("acceptance.title")}</H3>
            <P className="text-muted-foreground">{t("acceptance.description")}</P>
          </div>

          <div className="flex flex-col gap-3">
            <H3>{t("permitted.title")}</H3>
            <ul className="list-disc list-inside flex flex-col gap-2 text-sm text-muted-foreground leading-7">
              <li>{t("permitted.items.create")}</li>
              <li>{t("permitted.items.share")}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <H3>{t("prohibited.title")}</H3>
            <ul className="list-disc list-inside flex flex-col gap-2 text-sm text-muted-foreground leading-7">
              <li>{t("prohibited.items.illegal")}</li>
              <li>{t("prohibited.items.security")}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <H3>{t("ip.title")}</H3>
            <P className="text-muted-foreground">{t("ip.description")}</P>
          </div>

          <div className="flex flex-col gap-3">
            <H3>{t("changes.title")}</H3>
            <P className="text-muted-foreground">{t("changes.description")}</P>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
