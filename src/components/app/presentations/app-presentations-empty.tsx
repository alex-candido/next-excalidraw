"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { AppStartNewModal } from "@/components/app/start/app-start-new-modal";

export function AppPresentationsEmpty({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("app.presentations.empty");
  const tNew = useTranslations("app.new");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "app-presentations-empty flex flex-col items-center gap-4 py-16 text-center",
          className,
        )}
        {...props}
      >
        <Muted className="app-presentations-empty-label text-sm">
          {t("label")}
        </Muted>
        <Button
          variant="outline"
          size="sm"
          className="app-presentations-empty-action gap-1.5"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="size-3.5" />
          {tNew("trigger")}
        </Button>
      </div>

      <AppStartNewModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
