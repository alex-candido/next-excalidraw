"use client";

import { Loader2, Paperclip, SendHorizonal } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useAppStart } from "@/providers/app/app-start-provider";

export function AppStartFormActions() {
  const t = useTranslations("app.start.form");
  const { prompt, isSubmitting, onSubmit } = useAppStart();

  return (
    <div className="app-start-form-actions flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label={t("upload")}>
        <Paperclip className="size-4" />
      </Button>
      <Button
        size="sm"
        className="gap-1.5"
        onClick={onSubmit}
        disabled={isSubmitting || !prompt.trim()}
      >
        {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <SendHorizonal className="size-3.5" />}
        {t("send")}
      </Button>
    </div>
  );
}
