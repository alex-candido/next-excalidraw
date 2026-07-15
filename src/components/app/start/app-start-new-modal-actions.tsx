"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

interface AppStartNewModalActionsProps {
  onCancel: () => void;
  onCreate: () => void;
  isSubmitting?: boolean;
}

export function AppStartNewModalActions({
  onCancel,
  onCreate,
  isSubmitting = false,
}: AppStartNewModalActionsProps) {
  const t = useTranslations("app.new.actions");

  return (
    <DialogFooter>
      <DialogClose render={<Button variant="ghost" size="sm" onClick={onCancel} />}>
        {t("cancel")}
      </DialogClose>
      <Button
        size="sm"
        className="gap-1.5"
        onClick={onCreate}
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5" />}
        {t("create")}
      </Button>
    </DialogFooter>
  );
}
