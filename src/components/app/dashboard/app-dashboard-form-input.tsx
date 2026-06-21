"use client";

import { useTranslations } from "next-intl";

import { Textarea } from "@/components/ui/textarea";

export function AppDashboardFormInput() {
  const t = useTranslations("app.dashboard.form");

  return (
    <Textarea
      className="app-dashboard-form-input min-h-32 resize-none border-0 shadow-none focus-visible:ring-0 text-base"
      placeholder={t("placeholder")}
    />
  );
}
