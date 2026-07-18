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

interface AppPresentationsOutlineRegenerateAllModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

// "Regenerar tudo" deixou de ser "atualiza o conteúdo dos cards existentes" e
// virou "substitui o outline inteiro" (pode até mudar a quantidade de cenas)
// — pede confirmação porque é bem mais destrutivo do que antes.
export function AppPresentationsOutlineRegenerateAllModal({
  open,
  onOpenChange,
  onConfirm,
}: AppPresentationsOutlineRegenerateAllModalProps) {
  const t = useTranslations("app.outline.hero.regenerateAllModal");
  const tActions = useTranslations("app.new.actions");

  function handleConfirm() {
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-presentations-outline-regenerate-all-modal sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" size="sm" />}>
            {tActions("cancel")}
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            className="app-presentations-outline-regenerate-all-modal-confirm"
            onClick={handleConfirm}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
