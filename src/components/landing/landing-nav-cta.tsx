import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export async function LandingNavCta() {
  const t = await getTranslations("landing.nav.cta");

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
