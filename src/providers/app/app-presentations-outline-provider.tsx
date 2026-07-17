"use client";

import { useParams } from "next/navigation";
import { createContext, ReactNode, useContext } from "react";

import { useAppOutlineGenerate } from "@/hooks/app/outline/use-app-outline-generate";
import { useAppOutlineHydration } from "@/hooks/app/outline/use-app-outline-hydration";
import { useAppOutlineRegenerate } from "@/hooks/app/outline/use-app-outline-regenerate";
import { useOutlineIsGenerating } from "@/store/app-outline-store";

export {
  useOutlineActions,
  useOutlineCard,
  useOutlineIsGenerating,
  useOutlineIsRegeneratingAll,
  useOutlineIsWaitingHydration,
  useOutlineOutlines,
  useOutlineParams,
  useOutlinePrompt,
  useOutlineRegeneratingIds,
} from "@/store/app-outline-store";
export type { OutlineCardState } from "@/store/app-outline-store";

// Só os valores derivados do servidor que raramente mudam, mais as funções
// que orquestram mutations de react-query (onGenerate/onRegenerate*, que
// precisam de mutateAsync — por isso ficam aqui, não viram ação pura da
// store) — o estado de edição em si (outlines, prompt, params,
// regeneratingIds) vive no Zustand (store/app-outline-store.ts), lido direto
// pelos componentes via os hooks re-exportados acima. Ver
// docs/sdd/1-product/pm/decisions.md.
interface AppPresentationsOutlineContextProps {
  title: string;
  isLoading: boolean;
  isGeneratingInitial: boolean;
  isGenerating: boolean;
  onRegenerateCard: (id: string) => void;
  onRegenerateAll: () => void;
  onGenerate: () => void;
}

const AppPresentationsOutlineContext = createContext<AppPresentationsOutlineContextProps | undefined>(undefined);

// Provider fica só composição — hidratação (fetch + hidratar a store),
// regenerar (individual/tudo, com rastreio) e o submit final (gerar+navegar)
// são hooks próprios (hooks/app/outline/use-app-outline-*.ts), cada um com uma
// responsabilidade só.
export const AppPresentationsOutlineProvider = ({ children }: { children: ReactNode }) => {
  const routeParams = useParams<{ id?: string; lang?: string }>();
  const presentationId = routeParams.id ?? "";
  const lang = routeParams.lang ?? "";

  const { presentation, isLoading, isGeneratingInitial } = useAppOutlineHydration(presentationId);
  const isGenerating = useOutlineIsGenerating();
  const { onRegenerateCard, onRegenerateAll } = useAppOutlineRegenerate(presentationId);
  const { onGenerate } = useAppOutlineGenerate(presentationId, lang);

  const value: AppPresentationsOutlineContextProps = {
    title: presentation?.title ?? "",
    isLoading,
    isGeneratingInitial,
    isGenerating,
    onRegenerateCard,
    onRegenerateAll,
    onGenerate,
  };

  return (
    <AppPresentationsOutlineContext.Provider value={value}>
      {children}
    </AppPresentationsOutlineContext.Provider>
  );
};

export const useAppPresentationsOutline = () => {
  const context = useContext(AppPresentationsOutlineContext);
  if (context === undefined) {
    throw new Error("useAppPresentationsOutline must be used within an AppPresentationsOutlineProvider");
  }
  return context;
};
