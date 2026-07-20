import { arrayMove } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { createAppStore } from "@/lib/zustand";
import { OutlineRepresentation, OutlineType } from "@/lib/drizzle/schema/outline";

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
  // Rascunho — o que aparece nos controles do Hero, editável à vontade, sem
  // efeito em nada sozinho (ver conversa 2026-07-18: só "Regenerar tudo"
  // commita isso de verdade). `persisted*` é o que está realmente salvo em
  // presentation_entry — regenerar 1 card usa persisted*, não o rascunho.
  prompt: string;
  params: AppPresentationsOutlineParams;
  persistedPrompt: string;
  persistedParams: AppPresentationsOutlineParams;
  hasHydrated: boolean;
  regeneratingIds: Set<string>;
  isRegeneratingAll: boolean;
  isGenerating: boolean;

  // Chamadas pelos hooks de orquestração (react-query), não por consumidor de UI.
  resetForPresentation: (presentationId: string) => void;
  hydrate: (outlines: OutlineCardState[], prompt: string, params: AppPresentationsOutlineParams) => void;
  applyRegenerateResult: (id: string, fresh: Pick<OutlineCardState, "title" | "description" | "concepts" | "representation" | "layout" | "updatedAt">) => void;
  applyRegenerateAllResult: (outlines: OutlineCardState[], prompt: string, params: AppPresentationsOutlineParams) => void;
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

// Mínimo pra sempre ter pelo menos 1 capa + 1 conteúdo + 1 encerramento —
// única regra estrutural que resta (ver decisão 2026-07-19, substitui a
// trava fixa por item que existia antes).
export const MIN_OUTLINES = 3;

// `type` não é mais um atributo fixo por item — é sempre derivado da
// POSIÇÃO no array (primeiro = cover, último = closing, meio = content).
// Reaplicado a cada reorder/add/delete/hydrate: se o usuário arrasta o que
// era capa pra posição 2, o item que assumir a posição 0 vira a capa nova
// automaticamente, sem trava nenhuma pra impedir. Mesmo padrão em
// app-studio-store.ts (lá o campo se chama outlineType).
function deriveTypes(items: OutlineCardState[]): OutlineCardState[] {
  return items.map((item, index) => ({
    ...item,
    order: index,
    type: index === 0 ? OutlineType.cover : index === items.length - 1 ? OutlineType.closing : OutlineType.content,
  }));
}

// Store global (não por-componente) — mesmo padrão do Studio
// (store/app-studio-store.ts): montado globalmente em providers/app/index.tsx,
// troca de presentation precisa resetar explicitamente.
export const useOutlineStore = createAppStore<OutlineStoreState>("outline", (set, get) => ({
  presentationId: "",
  outlines: [],
  prompt: "",
  params: DEFAULT_PARAMS,
  persistedPrompt: "",
  persistedParams: DEFAULT_PARAMS,
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
      persistedPrompt: "",
      persistedParams: DEFAULT_PARAMS,
      hasHydrated: false,
      regeneratingIds: new Set(),
      isRegeneratingAll: false,
      isGenerating: false,
    });
  },

  hydrate: (outlines, prompt, params) =>
    set({ outlines: deriveTypes(outlines), prompt, params, persistedPrompt: prompt, persistedParams: params, hasHydrated: true }),

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

  // "Regenerar tudo" completou — troca a lista inteira pela nova (pode ter
  // quantidade diferente) e sincroniza persisted* com o que acabou de ser
  // commitado. O rascunho (prompt/params) já está igual, mas atualiza junto
  // por segurança (evita qualquer divergência de uma edição no meio do request).
  applyRegenerateAllResult: (outlines, prompt, params) =>
    set({ outlines: deriveTypes(outlines), prompt, params, persistedPrompt: prompt, persistedParams: params }),

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

  // `concepts` são palavras-chave extraídas do título+descrição originais pela
  // IA — editar qualquer um dos dois sem atualizar concepts manda pro
  // slideWorkflow um conteúdo novo com palavras-chave de um conteúdo antigo
  // (mesma classe de conflito do representation+layout acima). Limpa junto,
  // só Regenerar produz os três coerentes entre si de novo.
  onTitleChange: (id, value) =>
    set((state) => ({
      outlines: state.outlines.map((o) => (o.id === id ? { ...o, title: value, concepts: [] } : o)),
    })),

  onDescriptionChange: (id, value) =>
    set((state) => ({
      outlines: state.outlines.map((o) => (o.id === id ? { ...o, description: value, concepts: [] } : o)),
    })),

  // `layout` descreve como os elementos se organizam pra ESSA representação
  // específica (ex: "fluxo da esquerda pra direita com 4 etapas") — trocar a
  // representação sem limpar o layout manda uma descrição que contradiz a
  // nova escolha direto pro slideWorkflow (onGenerate manda os dois juntos,
  // sem checar consistência). `layout` não é editável na mão por isso — só
  // Regenerar produz um par representação+layout coerente entre si.
  onRepresentationChange: (id, value) =>
    set((state) => ({
      outlines: state.outlines.map((o) => (o.id === id ? { ...o, representation: value, layout: "" } : o)),
    })),

  // Reorder é sempre livre — não existe mais item travado por posição.
  // type é recalculado pra todo mundo depois: quem cair na posição 0/última
  // vira a capa/encerramento nova, automaticamente (ver deriveTypes).
  onReorder: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.outlines.findIndex((o) => o.id === activeId);
      const newIndex = state.outlines.findIndex((o) => o.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      return { outlines: deriveTypes(arrayMove(state.outlines, oldIndex, newIndex)) };
    }),

  // Única regra que resta: nunca menos que MIN_OUTLINES itens (garante 1
  // capa + 1 conteúdo + 1 encerramento sempre existindo) — não importa mais
  // qual item está sendo apagado, cover/closing incluídos.
  onDelete: (id) =>
    set((state) => {
      if (state.outlines.length <= MIN_OUTLINES) return state;
      return { outlines: deriveTypes(state.outlines.filter((o) => o.id !== id)) };
    }),

  // Insere antes do encerramento (se existir) em vez de sempre no final —
  // senão "Adicionar cena" nasceria depois do item que vai virar
  // encerramento, quebrando a estrutura capa→conteúdo→encerramento. type
  // real (sempre "content" aqui, já que nunca é o primeiro nem o último)
  // vem do deriveTypes, não precisa fixar na mão.
  onAdd: () =>
    set((state) => {
      const closingIndex = state.outlines.findIndex((o) => o.type === OutlineType.closing);
      const insertAt = closingIndex === -1 ? state.outlines.length : closingIndex;

      const newItem: OutlineCardState = {
        id: crypto.randomUUID(),
        order: insertAt,
        type: OutlineType.content,
        title: "",
        description: "",
        concepts: [],
        representation: OutlineRepresentation.auto,
        layout: "",
        isLocal: true,
      };

      const next = [...state.outlines.slice(0, insertAt), newItem, ...state.outlines.slice(insertAt)];
      return { outlines: deriveTypes(next) };
    }),
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

export function useOutlinePersistedPrompt() {
  return useOutlineStore((s) => s.persistedPrompt);
}

export function useOutlinePersistedParams() {
  return useOutlineStore((s) => s.persistedParams);
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

// Regra é sempre a mesma pra todo mundo (não é por item) — um hook só, os
// cards leem direto em vez de receber via prop.
export function useOutlineCanDelete() {
  return useOutlineStore((s) => s.outlines.length > MIN_OUTLINES);
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
