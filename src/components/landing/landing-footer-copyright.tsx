import { getTranslations } from "next-intl/server";

import { Muted } from "@/components/ui/typography";

export async function LandingFooterCopyright() {
  const t = await getTranslations("landing.footer");

  return (
    <Muted>© {new Date().getFullYear()} Next Excalidraw. {t("copyright")}</Muted>
  );
}
