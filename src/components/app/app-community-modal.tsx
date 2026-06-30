"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PresentationType } from "@/lib/drizzle/schema/presentation";

import { AppCommunityModalDuplicateView } from "@/components/app/app-community-modal-duplicate-view";
import { AppCommunityModalAuthorView } from "@/components/app/app-community-modal-author-view";

export type CommunityModalItem = {
  id: string;
  title: string;
  type: (typeof PresentationType)[keyof typeof PresentationType];
  typeLabel: string;
  createdAtLabel: string;
  createdBy: string;
};

type ModalView =
  | { kind: "duplicate"; item: CommunityModalItem }
  | { kind: "author"; authorName: string; authorAvatar?: string };

interface AppCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CommunityModalItem;
}

export function AppCommunityModal({
  open,
  onOpenChange,
  item,
}: AppCommunityModalProps) {
  const t = useTranslations("app.community.modal");
  const [view, setView] = useState<ModalView>({ kind: "duplicate", item });

  function handleAuthorClick() {
    const currentItem = view.kind === "duplicate" ? view.item : item;
    setView({ kind: "author", authorName: currentItem.createdBy });
  }

  function handlePresentationSelect(selected: CommunityModalItem) {
    setView({ kind: "duplicate", item: selected });
  }

  function handleBack() {
    setView({ kind: "duplicate", item: view.kind === "duplicate" ? view.item : item });
  }

  function handleClose() {
    onOpenChange(false);
  }

  const currentItem = view.kind === "duplicate" ? view.item : item;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-community-modal gap-0 overflow-hidden p-0 sm:max-w-md">
        {view.kind === "duplicate" && (
          <DialogHeader className="sr-only">
            <DialogTitle>{currentItem.title}</DialogTitle>
            <DialogDescription>{t("duplicate")}</DialogDescription>
          </DialogHeader>
        )}

        {view.kind === "author" && (
          <div className="app-community-modal-back flex items-center gap-2 border-b px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-1 gap-1.5 text-xs"
              onClick={handleBack}
            >
              <ArrowLeft className="size-3.5" />
              {t("back")}
            </Button>
            <span className="app-community-modal-author-label truncate text-xs text-muted-foreground">
              {t("author.presentations", { name: view.authorName })}
            </span>
          </div>
        )}

        {view.kind === "duplicate" && (
          <AppCommunityModalDuplicateView
            item={view.item}
            onAuthorClick={handleAuthorClick}
            onClose={handleClose}
          />
        )}

        {view.kind === "author" && (
          <AppCommunityModalAuthorView
            authorName={view.authorName}
            authorAvatar={view.authorAvatar}
            onPresentationSelect={handlePresentationSelect}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
