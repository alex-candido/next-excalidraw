"use client";

import { useParams } from "next/navigation";
import { createContext, ReactNode, useContext } from "react";

import { useAppStudioHydration } from "@/hooks/app/studio/use-app-studio-hydration";
import { useAppStudioSave } from "@/hooks/app/studio/use-app-studio-save";
import { routing } from "@/i18n/routing";
import { formatRelativeDate } from "@/lib/utils";

export {
  useStudioActions,
  useStudioActivePanel,
  useStudioActiveSlide,
  useStudioActiveSlideId,
  useStudioIsSaving,
  useStudioIsWaitingSlides,
  useStudioSlidePreviewElements,
  useStudioSlides
} from "@/store/app-studio-store";
export type {
  AppPresentationsStudioScene,
  AppPresentationsStudioSlide,
  StudioPanelKey
} from "@/store/app-studio-store";

// Só os valores derivados do servidor que raramente mudam (1x por load da
// presentation, não a cada edição) — o estado de edição em si (slides,
// activeSlideId, painel, etc.) vive no Zustand (store/app-studio-store.ts),
// que dá subscription seletiva por slice em vez de re-renderizar tudo a cada
// mudança, como Context faria. Ver docs/sdd/1-product/pm/decisions.md.
type AppPresentationsStudioContextProps = {
  title: string;
  createdAtLabel: string;
  createdBy: string;
  isFavorited: boolean;
  isLoading: boolean;
  onSave: () => void;
};

const AppPresentationsStudioContext = createContext<AppPresentationsStudioContextProps | undefined>(undefined);

// Provider fica só composição — hidratação (fetch + hidratar a store +
// thumbnail automática) e save (persistir slide novo + bulk-update + thumbnail
// da capa) são hooks próprios (hooks/app/studio/use-app-studio-*.ts), cada um com uma
// responsabilidade só. Ver docs/sdd/1-product/pm/decisions.md.
export const AppPresentationsStudioProvider = ({ children }: { children: ReactNode }) => {
  const routeParams = useParams<{ id?: string; lang?: string }>();
  const presentationId = routeParams.id ?? "";
  const lang = routeParams.lang ?? routing.defaultLocale;

  const { presentation, isLoading } = useAppStudioHydration(presentationId);
  const { onSave } = useAppStudioSave(presentationId, presentation);

  const value: AppPresentationsStudioContextProps = {
    title: presentation?.title ?? "",
    createdAtLabel: presentation ? formatRelativeDate(presentation.createdAt, lang) : "",
    createdBy: "",
    isFavorited: false,
    isLoading,
    onSave,
  };

  return (
    <AppPresentationsStudioContext.Provider value={value}>
      {children}
    </AppPresentationsStudioContext.Provider>
  );
};

export const useAppPresentationsStudio = () => {
  const context = useContext(AppPresentationsStudioContext);
  if (context === undefined) {
    throw new Error("useAppPresentationsStudio must be used within an AppPresentationsStudioProvider");
  }
  return context;
};