"use client";

import { useTranslations } from "next-intl";

import { Textarea } from "@/components/ui/textarea";
import { useAppStart } from "@/providers/app/app-start-provider";

export function AppStartFormInput() {
  const t = useTranslations("app.start.form");
  const { prompt, onPromptChange } = useAppStart();

  return (
    <Textarea
      className="app-start-form-input min-h-32 resize-none border-0 shadow-none focus-visible:ring-0 text-base"
      placeholder={t("placeholder")}
      value={prompt}
      onChange={(e) => onPromptChange(e.target.value)}
    />
  );
}
