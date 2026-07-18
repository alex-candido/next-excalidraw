"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";

export function AppPresentationsOutlineGenerating() {
  const tHero = useTranslations("app.outline.hero");
  const t = useTranslations("app.outline.generating");

  return (
    <div className="app-presentations-outline-generating mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-6">
      <Button
        variant="ghost"
        size="sm"
        render={<Link href="/app/presentations" />}
        nativeButton={false}
        className="app-presentations-outline-generating-back -ml-2 w-fit gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {tHero("back")}
      </Button>

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
