"use client";

import { useTranslations } from "next-intl";

import { Textarea } from "@/components/ui/textarea";

interface AppPresentationsOutlineHeroPromptProps {
  value: string;
  onChange: (value: string) => void;
}

export function AppPresentationsOutlineHeroPrompt({
  value,
  onChange,
}: AppPresentationsOutlineHeroPromptProps) {
  const t = useTranslations("app.outline.hero.prompt");

  return (
    <div className="app-presentations-outline-hero-prompt flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{t("label")}</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={t("placeholder")}
        className="app-presentations-outline-hero-prompt-input resize-none border-transparent bg-muted/40 transition-colors hover:border-input focus-visible:border-ring focus-visible:bg-background"
      />
    </div>
  );
}
