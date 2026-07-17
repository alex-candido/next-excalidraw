import { arrayMove } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { createAppStore } from "@/lib/zustand";

import type { AppPresentationsOutlineCardItem } from "@/components/app/presentations/outline/app-presentations-outline-card";
import type { AppPresentationsOutlineParams } from "@/components/app/presentations/outline/outline-enum-labels";

export interface OutlineCardState extends AppPresentationsOutlineCardItem {
  layout: string;
  updatedAt?: string;
  isLocal?: boolean;
}

interface OutlineStoreState {
  presentationId: string;
  outlines: OutlineCardState[];
  prompt: string;
  params: AppPresentationsOutlineParams;
  hasHydrated: boolean;
  regeneratingIds: Set<string>;
  isRegeneratingAll: boolean;
  isGenerating: boolean;

  // Chamadas pelos hooks de orquestração (react-query), não por consumidor de UI.
  resetForPresentation: (presentationId: string) => void;
  hydrate: (outlines: OutlineCardState[], prompt: string, params: AppPresentationsOutlineParams) => void;
  applyRegenerateResult: (id: string, fresh: Pick<OutlineCardState, "title" | "description" | "concepts" | "representation" | "layout" | "updatedAt">) => void;
  markRegenerating: (id: string) => void;
  unmarkRegenerating: (id: string) => void;
  setIsRegeneratingAll: (value: boolean) => void;
  setIsGenerating: (value: boolean) => void;

  onPromptChange: (value: string) => void;
  onParamChange: (key: keyof AppPresentationsOutlineParams, value: number) => void;
  onTitleChange: (id: string, value: string) => void;
  onDescriptionChange: (id: string, value: string) => void;
  onRepresentationChange: (id: string, value: number) => void;
  onReorder: (activeId: string, overId: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const DEFAULT_PARAMS: AppPresentationsOutlineParams = {
  language: 0, aspectRatio: 0, slideCount: 0, audience: 0, scenario: 0, amount: 0, theme: 0,
};

// Store global (não por-componente) — mesmo padrão do Studio
// (store/app-studio-store.ts): montado globalmente em providers/app/index.tsx,
// troca de presentation precisa resetar explicitamente.
export const useOutlineStore = createAppStore<OutlineStoreState>("outline", (set, get) => ({
  presentationId: "",
  outlines: [],
  prompt: "",
  params: DEFAULT_PARAMS,
  hasHydrated: false,
  regeneratingIds: new Set(),
  isRegeneratingAll: false,
  isGenerating: false,

  resetForPresentation: (presentationId) => {
    if (get().presentationId === presentationId) return;
    set({
      presentationId,
      outlines: [],
      prompt: "",
      params: DEFAULT_PARAMS,
      hasHydrated: false,
      regeneratingIds: new Set(),
      isRegeneratingAll: false,
      isGenerating: false,
    });
  },

  hydrate: (outlines, prompt, params) => set({ outlines, prompt, params, hasHydrated: true }),

  // Chamado pelo hook de regenerate quando o poll detecta que o updatedAt do
  // outline mudou de verdade (ver use-app-outline-regenerate.ts) — atualiza só
  // esse item (preserva referência dos outros, pra quem lê via useOutlineCard
  // não re-renderizar à toa) e tira ele de regeneratingIds.
  applyRegenerateResult: (id, fresh) =>
    set((state) => ({
      outlines: state.outlines.map((o) => (o.id === id ? { ...o, ...fresh } : o)),
      regeneratingIds: (() => {
        const next = new Set(state.regeneratingIds);
        next.delete(id);
        return next;
      })(),
    })),

  markRegenerating: (id) => set((state) => ({ regeneratingIds: new Set(state.regeneratingIds).add(id) })),

  unmarkRegenerating: (id) =>
    set((state) => {
      const next = new Set(state.regeneratingIds);
      next.delete(id);
      return { regeneratingIds: next };
    }),

  setIsRegeneratingAll: (value) => set({ isRegeneratingAll: value }),
  setIsGenerating: (value) => set({ isGenerating: value }),

  onPromptChange: (value) => set({ prompt: value }),

  onParamChange: (key, value) => set((state) => ({ params: { ...state.params, [key]: value } })),

  onTitleChange: (id, value) =>
    set((state) => ({ outlines: state.outlines.map((o) => (o.id === id ? { ...o, title: value } : o)) })),

  onDescriptionChange: (id, value) =>
    set((state) => ({ outlines: state.outlines.map((o) => (o.id === id ? { ...o, description: value } : o)) })),

  onRepresentationChange: (id, value) =>
    set((state) => ({ outlines: state.outlines.map((o) => (o.id === id ? { ...o, representation: value } : o)) })),

  onReorder: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.outlines.findIndex((o) => o.id === activeId);
      const newIndex = state.outlines.findIndex((o) => o.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      return {
        outlines: arrayMove(state.outlines, oldIndex, newIndex).map((item, index) => ({ ...item, order: index })),
      };
    }),

  onDelete: (id) =>
    set((state) => ({
      outlines: state.outlines.filter((o) => o.id !== id).map((item, index) => ({ ...item, order: index })),
    })),

  onAdd: () =>
    set((state) => ({
      outlines: [
        ...state.outlines,
        {
          id: crypto.randomUUID(),
          order: state.outlines.length,
          type: 1,
          title: "",
          description: "",
          concepts: [],
          representation: 0,
          layout: "",
          isLocal: true,
        },
      ],
    })),
}));

// Selector hooks granulares — cada consumidor só re-renderiza quando o slice
// específico que ele lê muda. useOutlineCard em particular é o que importa:
// digitar no título de um card não re-renderiza os outros, porque o `.map()`
// das ações acima preserva a referência dos itens não afetados.
export function useOutlineOutlines() {
  return useOutlineStore((s) => s.outlines);
}

export function useOutlineCard(id: string) {
  return useOutlineStore((s) => s.outlines.find((o) => o.id === id));
}

export function useOutlinePrompt() {
  return useOutlineStore((s) => s.prompt);
}

export function useOutlineParams() {
  return useOutlineStore((s) => s.params);
}

export function useOutlineRegeneratingIds() {
  return useOutlineStore((s) => s.regeneratingIds);
}

export function useOutlineIsRegeneratingAll() {
  return useOutlineStore((s) => s.isRegeneratingAll);
}

export function useOutlineIsGenerating() {
  return useOutlineStore((s) => s.isGenerating);
}

export function useOutlineIsWaitingHydration() {
  return useOutlineStore((s) => !s.hasHydrated);
}

export function useOutlineActions() {
  return useOutlineStore(
    useShallow((s) => ({
      onPromptChange: s.onPromptChange,
      onParamChange: s.onParamChange,
      onTitleChange: s.onTitleChange,
      onDescriptionChange: s.onDescriptionChange,
      onRepresentationChange: s.onRepresentationChange,
      onReorder: s.onReorder,
      onDelete: s.onDelete,
      onAdd: s.onAdd,
    })),
  );
}
