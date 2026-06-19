import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { H3, P } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingTransparencyPrivacyPolicyContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.transparency.privacyPolicy.sections");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-transparency-privacy-policy-content w-full max-w-3xl mx-auto flex flex-col gap-10",
            className,
          )}
          {...props}
        >
          <div className="flex flex-col gap-3">
            <H3>{t("data.title")}</H3>
            <P className="text-muted-foreground">{t("data.description")}</P>
          </div>

          <div className="flex flex-col gap-3">
            <H3>{t("use.title")}</H3>
            <ul className="list-disc list-inside flex flex-col gap-2 text-sm text-muted-foreground leading-7">
              <li>{t("use.items.auth")}</li>
              <li>{t("use.items.storage")}</li>
              <li>{t("use.items.comms")}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <H3>{t("rights.title")}</H3>
            <P className="text-muted-foreground">{t("rights.description")}</P>
          </div>

          <div className="flex flex-col gap-3">
            <H3>{t("cookies.title")}</H3>
            <P className="text-muted-foreground">{t("cookies.description")}</P>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
