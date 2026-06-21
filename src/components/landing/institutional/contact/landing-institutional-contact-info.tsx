import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { H3, Muted, P } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingInstitutionalContactInfo({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.institutional.contact");

  return (
    <LayoutSection>
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "landing-institutional-contact-info w-full max-w-3xl mx-auto flex flex-col gap-10",
            className,
          )}
          {...props}
        >
          <div className="landing-institutional-contact-channels flex flex-col gap-4">
            <H3>{t("channels.title")}</H3>
            <div className="flex flex-col gap-3 rounded-lg border p-6">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <Muted className="text-xs uppercase tracking-wide font-semibold">
                    {t("channels.email.label")}
                  </Muted>
                  <span className="text-sm font-medium">
                    {t("channels.email.value")}
                  </span>
                </div>
              </div>
              <div className="border-t pt-3 flex flex-col gap-0.5">
                <Muted className="text-xs uppercase tracking-wide font-semibold">
                  {t("channels.response.label")}
                </Muted>
                <span className="text-sm text-muted-foreground">
                  {t("channels.response.value")}
                </span>
              </div>
            </div>
          </div>

          <div className="landing-institutional-contact-report flex flex-col gap-3">
            <H3>{t("report.title")}</H3>
            <P className="text-muted-foreground">{t("report.description")}</P>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
