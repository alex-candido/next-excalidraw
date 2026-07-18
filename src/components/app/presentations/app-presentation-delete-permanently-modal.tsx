"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppPresentationDeletePermanentlyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onConfirm?: () => void;
}

export function AppPresentationDeletePermanentlyModal({
  open,
  onOpenChange,
  title,
  onConfirm,
}: AppPresentationDeletePermanentlyModalProps) {
  const t = useTranslations("app.presentations.deletePermanently.modal");
  const tActions = useTranslations("app.new.actions");

  function handleConfirm() {
    onConfirm?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-presentation-delete-permanently-modal sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="truncate">{title}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" size="sm" />}>
            {tActions("cancel")}
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            className="app-presentation-delete-permanently-modal-confirm"
            onClick={handleConfirm}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
