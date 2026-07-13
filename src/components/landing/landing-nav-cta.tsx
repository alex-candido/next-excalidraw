import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingNavCta() {
  const t = useTranslations("landing.nav.cta");

  return (
    <>
      <Button variant="ghost" render={<Link href="/auth/sign-in" />} nativeButton={false}>
        {t("signIn")}
      </Button>
      <Button render={<Link href="/auth/sign-up" />} nativeButton={false}>
        {t("getStarted")}
      </Button>
    </>
  );
}
