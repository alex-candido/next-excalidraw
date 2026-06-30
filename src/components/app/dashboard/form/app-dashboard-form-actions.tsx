"use client";

import { Paperclip, SendHorizonal } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function AppDashboardFormActions() {
  const t = useTranslations("app.dashboard.form");

  return (
    <div className="app-dashboard-form-actions flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label={t("upload")}>
        <Paperclip className="size-4" />
      </Button>
      <Button
        size="sm"
        className="gap-1.5"
        render={<Link href="/app/presentations/mock/outline" />}
        nativeButton={false}
      >
        <SendHorizonal className="size-3.5" />
        {t("send")}
      </Button>
    </div>
  );
}
