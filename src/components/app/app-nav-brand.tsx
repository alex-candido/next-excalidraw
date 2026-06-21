import { PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function AppNavBrand() {
  const t = await getTranslations("app.brand");

  return (
    <Link href="/app" className="app-nav-brand flex items-center gap-2.5">
      <PenLine className="size-5 shrink-0" />
      <div className="flex flex-col">
        <span className="font-semibold text-sm leading-tight">Next Excalidraw</span>
        <span className="text-xs text-muted-foreground leading-tight">{t("subtitle")}</span>
      </div>
    </Link>
  );
}
