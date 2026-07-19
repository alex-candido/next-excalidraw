"use client";

import { ChevronDown, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AppPresentationsOutlineHeroControls } from "@/components/app/presentations/outline/hero/app-presentations-outline-hero-controls";
import { AppPresentationsOutlineHeroPrompt } from "@/components/app/presentations/outline/hero/app-presentations-outline-hero-prompt";
import { AppPresentationsOutlineHeroTags } from "@/components/app/presentations/outline/hero/app-presentations-outline-hero-tags";
import { AppPresentationsOutlineRegenerateAllModal } from "@/components/app/presentations/outline/app-presentations-outline-regenerate-all-modal";
import {
  useAppPresentationsOutline,
  useOutlineActions,
  useOutlineIsRegeneratingAll,
  useOutlineParams,
  useOutlinePrompt,
} from "@/providers/app/app-presentations-outline-provider";

interface AppPresentationsOutlineHeroProps {
  className?: string;
}

export function AppPresentationsOutlineHero({ className }: AppPresentationsOutlineHeroProps) {
  const t = useTranslations("app.outline.hero");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegenerateAllModalOpen, setIsRegenerateAllModalOpen] = useState(false);
  const { title, onRegenerateAll } = useAppPresentationsOutline();
  const prompt = useOutlinePrompt();
  const params = useOutlineParams();
  const isRegeneratingAll = useOutlineIsRegeneratingAll();
  const { onPromptChange, onParamChange } = useOutlineActions();

  return (
    <div
      className={cn(
        "app-presentations-outline-hero border-b bg-background px-4 py-4",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="app-presentations-outline-hero-toggle flex w-fit cursor-pointer items-center gap-1.5 text-left"
        >
          <h2 className="app-presentations-outline-hero-title truncate text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </button>

        {isExpanded ? (
          <div className="app-presentations-outline-hero-expanded flex flex-col gap-3">
            <AppPresentationsOutlineHeroPrompt value={prompt} onChange={onPromptChange} />
            <AppPresentationsOutlineHeroControls value={params} onChange={onParamChange} />
          </div>
        ) : (
          <AppPresentationsOutlineHeroTags params={params} />
        )}

        <div className="app-presentations-outline-hero-footer flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRegenerateAllModalOpen(true)}
            disabled={isRegeneratingAll}
            className="app-presentations-outline-hero-regenerate gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("size-3.5", isRegeneratingAll && "animate-spin")} />
            {isRegeneratingAll ? t("regenerating") : t("regenerate")}
          </Button>
        </div>
      </div>

      <AppPresentationsOutlineRegenerateAllModal
        open={isRegenerateAllModalOpen}
        onOpenChange={setIsRegenerateAllModalOpen}
        onConfirm={onRegenerateAll}
      />
    </div>
  );
}
