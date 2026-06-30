"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { PresentationType } from "@/lib/drizzle/schema/presentation";

import type { CommunityModalItem } from "@/components/app/app-community-modal";
import { AppPresentationCard } from "@/components/app/app-presentation-card";

const AUTHOR_ITEMS: Omit<CommunityModalItem, "createdBy">[] = [
  { id: "a1", title: "Introdução ao DDD", type: PresentationType.multi, typeLabel: "Multi-slide", createdAtLabel: "há 4 dias" },
  { id: "a2", title: "Microsserviços na prática", type: PresentationType.single, typeLabel: "Single-slide", createdAtLabel: "há 1 semana" },
  { id: "a3", title: "Padrões de resiliência", type: PresentationType.multi, typeLabel: "Multi-slide", createdAtLabel: "há 2 semanas" },
  { id: "a4", title: "API design com REST", type: PresentationType.single, typeLabel: "Single-slide", createdAtLabel: "há 1 mês" },
  { id: "a5", title: "Arquitetura de software", type: PresentationType.multi, typeLabel: "Multi-slide", createdAtLabel: "há 3 semanas" },
  { id: "a6", title: "Desenvolvimento ágil", type: PresentationType.single, typeLabel: "Single-slide", createdAtLabel: "há 2 meses" },
  { id: "a7", title: "Arquitetura de software", type: PresentationType.multi, typeLabel: "Multi-slide", createdAtLabel: "há 3 semanas" },
  { id: "a8", title: "Desenvolvimento ágil", type: PresentationType.single, typeLabel: "Single-slide", createdAtLabel: "há 2 meses" },
  { id: "a9", title: "Arquitetura de software", type: PresentationType.multi, typeLabel: "Multi-slide", createdAtLabel: "há 3 semanas" },
  { id: "a10", title: "Desenvolvimento ágil", type: PresentationType.single, typeLabel: "Single-slide", createdAtLabel: "há 2 meses" },
];

interface AppCommunityModalAuthorViewProps {
  authorName: string;
  authorAvatar?: string;
  onPresentationSelect?: (item: CommunityModalItem) => void;
}

export function AppCommunityModalAuthorView({
  authorName,
  onPresentationSelect,
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

      <div className="app-community-modal-author-body flex flex-col gap-3 p-4">
        <div className="app-community-modal-author-scroll -mx-4 max-h-64 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="app-community-modal-author-grid grid grid-cols-2 gap-2">
            {AUTHOR_ITEMS.map((authorItem) => {
              const fullItem: CommunityModalItem = { ...authorItem, createdBy: authorName };
              return (
                <AppPresentationCard
                  key={authorItem.id}
                  title={authorItem.title}
                  type={authorItem.type}
                  typeLabel={authorItem.typeLabel}
                  createdAtLabel={authorItem.createdAtLabel}
                  createdBy={authorName}
                  actions={["share", "copyLink"]}
                  onSelect={() => onPresentationSelect?.(fullItem)}
                />
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" size="sm" />}>
            {t("close")}
          </DialogClose>
          <Button
            variant="outline"
            size="sm"
            className="app-community-modal-author-profile gap-1.5"
          >
            {t("author.viewProfile")}
            <ArrowRight className="size-3.5" />
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
