"use client";

import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { PresentationType } from "@/lib/drizzle/schema/presentation";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import type { CommunityModalItem } from "@/components/app/app-community-modal";

const AUTHOR_ITEMS: Omit<CommunityModalItem, "createdBy" | "createdAtLabel">[] = [
  {
    id: "a1",
    title: "Introdução ao DDD",
    type: PresentationType.multi,
    typeLabel: "Multi-slide",
  },
  {
    id: "a2",
    title: "Microsserviços na prática",
    type: PresentationType.single,
    typeLabel: "Single-slide",
  },
  {
    id: "a3",
    title: "Padrões de resiliência",
    type: PresentationType.multi,
    typeLabel: "Multi-slide",
  },
  {
    id: "a4",
    title: "API design com REST",
    type: PresentationType.single,
    typeLabel: "Single-slide",
  },
];

interface AppCommunityModalAuthorViewProps {
  authorName: string;
  authorAvatar?: string;
  onPresentationSelect?: (item: CommunityModalItem) => void;
  onClose?: () => void;
}

export function AppCommunityModalAuthorView({
  authorName,
  onPresentationSelect,
  onClose,
}: AppCommunityModalAuthorViewProps) {
  const t = useTranslations("app.community.modal");

  const initials = authorName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="app-community-modal-author-identity flex items-center gap-3 border-b px-4 py-3">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
        </Avatar>
        <span className="app-community-modal-author-name text-sm font-semibold">
          {authorName}
        </span>
      </div>

      <div className="app-community-modal-author-grid grid grid-cols-2 gap-2 overflow-y-auto p-4">
        {AUTHOR_ITEMS.map((authorItem) => {
          const fullItem: CommunityModalItem = {
            ...authorItem,
            createdBy: authorName,
            createdAtLabel: "",
          };
          return (
            <AppPresentationCard
              key={authorItem.id}
              title={authorItem.title}
              type={authorItem.type}
              typeLabel={authorItem.typeLabel}
              createdAtLabel=""
              createdBy={authorName}
              actions={[]}
              onSelect={() => onPresentationSelect?.(fullItem)}
            />
          );
        })}
      </div>

      <DialogFooter className="px-4 pb-4">
        <DialogClose
          render={<Button variant="ghost" size="sm" onClick={onClose} />}
        >
          {t("close")}
        </DialogClose>
      </DialogFooter>
    </>
  );
}
