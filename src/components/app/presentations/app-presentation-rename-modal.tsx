"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppPresentationRenameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onConfirm?: (title: string) => void;
}

export function AppPresentationRenameModal({
  open,
  onOpenChange,
  title,
  onConfirm,
}: AppPresentationRenameModalProps) {
  const t = useTranslations("app.presentations.rename.modal");
  const tActions = useTranslations("app.new.actions");
  const [value, setValue] = useState(title);

  useEffect(() => {
    if (open) setValue(title);
  }, [open, title]);

  function handleConfirm() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm?.(trimmed);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-presentation-rename-modal sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          maxLength={200}
          autoFocus
          className="app-presentation-rename-modal-input"
        />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" size="sm" />}>
            {tActions("cancel")}
          </DialogClose>
          <Button
            size="sm"
            className="app-presentation-rename-modal-confirm"
            disabled={!value.trim()}
            onClick={handleConfirm}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
