"use client";

import { Plus, Presentation } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Muted, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { AppStartNewModal } from "@/components/app/start/app-start-new-modal";

interface AppPresentationsEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  // "no-data": conta não tem nenhuma presentation ainda (CTA de criar faz
  // sentido). "no-results": há presentations, mas a tab/busca atual não
  // retornou nenhuma (CTA de criar não resolve, some da tela).
  variant?: "no-data" | "no-results";
}

export function AppPresentationsEmpty({
  variant = "no-data",
  className,
  ...props
}: AppPresentationsEmptyProps) {
  const t = useTranslations("app.presentations.empty");
  const tNew = useTranslations("app.new");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "app-presentations-empty flex flex-col items-center gap-1 py-16 text-center",
          className,
        )}
        {...props}
      >
        <div className="app-presentations-empty-icon mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
          <Presentation className="size-5 text-muted-foreground" />
        </div>
        <Small className="app-presentations-empty-title text-foreground">
          {variant === "no-data" ? t("noData.title") : t("noResults.title")}
        </Small>
        <Muted className="app-presentations-empty-description max-w-xs">
          {variant === "no-data" ? t("noData.description") : t("noResults.description")}
        </Muted>
        {variant === "no-data" && (
          <Button
            variant="outline"
            size="sm"
            className="app-presentations-empty-action mt-4 gap-1.5"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-3.5" />
            {tNew("trigger")}
          </Button>
        )}
      </div>

      {variant === "no-data" && (
        <AppStartNewModal open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </>
  );
}
