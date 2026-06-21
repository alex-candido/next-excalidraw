import { PenLine, Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Muted } from "@/components/ui/typography";

export async function AppDashboardFormEngine() {
  const t = await getTranslations("app.dashboard.form.engine");

  return (
    <div className="app-dashboard-form-engine flex items-center gap-2">
      <Muted className="text-xs">{t("label")}</Muted>
      <Badge variant="secondary" className="app-dashboard-form-engine-badge gap-1.5 rounded-full">
        <PenLine className="size-3" />
        {t("name")}
        <Lock className="size-2.5 opacity-50" />
      </Badge>
    </div>
  );
}
