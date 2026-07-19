"use client";

import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";

export function AppPresentationsOutlineGenerating() {
  const t = useTranslations("app.outline.generating");

  return (
    <div className="app-presentations-outline-generating mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-6">
      <div className="app-presentations-outline-generating-content flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <Spinner className="size-6 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <p className="app-presentations-outline-generating-title text-sm font-medium">{t("title")}</p>
          <p className="app-presentations-outline-generating-subtitle text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>
    </div>
  );
}
