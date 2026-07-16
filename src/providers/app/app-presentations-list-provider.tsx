"use client";

import { useParams } from "next/navigation";
import { createContext, ReactNode, useContext, useState } from "react";

import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { routing } from "@/i18n/routing";
import { PresentationStatus } from "@/lib/drizzle/schema/presentation";
import { formatRelativeDate } from "@/lib/utils";
import type { Presentation } from "@/schemas/app/presentation-schema";

export interface AppPresentationsListItem {
  id: string;
  title: string;
  type: number;
  language: number;
  slideCount: number;
  createdAtLabel: string;
  createdBy: string;
  isFavorited: boolean;
}

interface AppPresentationsListContextProps {
  items: AppPresentationsListItem[];
  trashItems: AppPresentationsListItem[];
  isLoading: boolean;
  isTrashView: boolean;
  onTrashToggle: () => void;
  onMoveToTrash: (id: string) => void;
}

const AppPresentationsListContext = createContext<AppPresentationsListContextProps | undefined>(undefined);

function toListItem(p: Presentation, lang: string): AppPresentationsListItem {
  return {
    id: p.id,
    title: p.title || "Untitled",
    type: p.entry.type,
    language: p.entry.language,
    slideCount: p.entry.slideCount,
    createdAtLabel: formatRelativeDate(p.createdAt, lang),
    // Sem infra de nome de usuário ainda (só temos userId) — gap conhecido, ver pm.md Backlog.
    createdBy: "",
    // Sem campo `favorited` no schema ainda — gap conhecido, ver pm.md Backlog.
    isFavorited: false,
  };
}

export const AppPresentationsListProvider = ({ children }: { children: ReactNode }) => {
  const { lang } = useParams<{ lang?: string }>();
  const { useList, useMoveToTrash } = useAppPresentation();
  const { data, isLoading } = useList();
  const moveToTrash = useMoveToTrash();
  const [isTrashView, setIsTrashView] = useState(false);

  const all = data ?? [];
  const items = all
    .filter((p) => p.status !== PresentationStatus.trash)
    .map((p) => toListItem(p, lang ?? routing.defaultLocale));
  const trashItems = all
    .filter((p) => p.status === PresentationStatus.trash)
    .map((p) => toListItem(p, lang ?? routing.defaultLocale));

  const value: AppPresentationsListContextProps = {
    items,
    trashItems,
    isLoading,
    isTrashView,
    onTrashToggle: () => setIsTrashView((v) => !v),
    onMoveToTrash: (id: string) => moveToTrash.mutate(id),
  };

  return (
    <AppPresentationsListContext.Provider value={value}>
      {children}
    </AppPresentationsListContext.Provider>
  );
};

export const useAppPresentationsList = () => {
  const context = useContext(AppPresentationsListContext);
  if (context === undefined) {
    throw new Error("useAppPresentationsList must be used within an AppPresentationsListProvider");
  }
  return context;
};
