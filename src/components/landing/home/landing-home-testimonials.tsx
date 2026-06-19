import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { H2, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function LandingHomeTestimonials({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("landing.home.testimonials");

  return (
    <LayoutSection id="testimonials">
      <LayoutContainer>
        <div className={cn("landing-home-testimonials w-full flex flex-col items-center gap-10", className)} {...props}>
          <div className="landing-home-testimonials-header flex flex-col items-center text-center gap-3">
            <H2>{t("title")}</H2>
          </div>

          <div className="landing-home-testimonials-grid w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["ana", "rafael", "carla"] as const).map((key) => (
              <Card key={key}>
                <CardHeader>
                  <CardDescription>"{t(`items.${key}.quote`)}"</CardDescription>
                  <Small>{t(`items.${key}.author`)}</Small>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
