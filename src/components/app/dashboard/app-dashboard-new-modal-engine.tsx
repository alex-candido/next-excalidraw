import { Lock, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppDashboardNewModalEngine() {
  const t = useTranslations("app.new.engine");

  return (
    <div className="app-dashboard-new-modal-engine flex items-center justify-between rounded-xl border bg-muted/30 p-3">
      <div className="app-dashboard-new-modal-engine-info flex items-center gap-2.5">
        <div className="app-dashboard-new-modal-engine-icon flex size-8 items-center justify-center rounded-md bg-muted">
          <PenLine className="size-4 text-muted-foreground" />
        </div>
        <div className="app-dashboard-new-modal-engine-text flex flex-col gap-0.5">
          <span className="app-dashboard-new-modal-engine-label text-xs text-muted-foreground">
            {t("label")}
          </span>
          <span className="app-dashboard-new-modal-engine-name text-sm font-medium">
            {t("name")}
          </span>
        </div>
      </div>
      <Lock className="size-3.5 text-muted-foreground/50" />
    </div>
  );
}
