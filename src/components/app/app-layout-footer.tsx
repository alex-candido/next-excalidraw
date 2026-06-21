import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Muted } from "@/components/ui/typography";

export async function AppLayoutFooter() {
  const t = await getTranslations("app.footer");

  return (
    <footer className="app-layout-footer border-t border-border mt-auto px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <Muted className="text-xs">{t("copyright")}</Muted>
        <div className="flex items-center gap-3">
          <Link
            href="/landing/transparency/legal/privacy-policy"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/landing/transparency/legal/terms"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
