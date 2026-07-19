import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { arrayMove } from "@dnd-kit/sortable";
import { useShallow } from "zustand/react/shallow";
import { createAppStore } from "@/lib/zustand";
import { OutlineType } from "@/lib/drizzle/schema/outline";

export interface AppPresentationsStudioScene {
  type: "excalidraw";
  version: number;
  source: string;
  elements: readonly ExcalidrawElement[];
  appState: { viewBackgroundColor: string; gridSize: number };
  files: Record<string, never>;
}

export interface AppPresentationsStudioSlide {
  id: string;
  order: number;
  title: string;
  thumbnail?: string;
  isHidden?: boolean;
  scene: AppPresentationsStudioScene;
  isLocal?: boolean;
  outlineId?: string;
  // Mesmo campo do Outline (outline.type) — precisa estar no slide pra
  // aplicar a mesma trava de posição (cover/closing fixos) aqui no Studio.
  // undefined pra slide local ainda sem outline (onAddSlide) — tratado como
  // "content" nos guards abaixo.
  outlineType?: number;
}

export type StudioPanelKey = "settings" | "source" | "history";

export function buildEmptyScene(): AppPresentationsStudioScene {
  return {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: [],
    appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
    files: {},
  };
}

const EMPTY_SLIDE: AppPresentationsStudioSlide = {
  id: "",
  order: 0,
  title: "",
  scene: buildEmptyScene(),
};

interface StudioStoreState {
  presentationId: string;
  slides: AppPresentationsStudioSlide[];
  activeSlideId: string;
  isSaving: boolean;
  activePanel: StudioPanelKey | null;
  hasHydrated: boolean;
  excalidrawApi: ExcalidrawImperativeAPI | null;
  // Elements do slide ativo, atualizado ao vivo pelo onChange do Excalidraw
  // (throttled) — só existe pra alimentar a prévia da sidebar em tempo real,
  // sem precisar tocar o array `slides` inteiro a cada edição (isso re-
  // renderizaria a lista inteira várias vezes por segundo). null enquanto
  // não houver nenhuma edição ainda nesta troca de slide — nesse caso o
  // consumidor cai pro scene.elements já capturado.
  liveActiveElements: readonly ExcalidrawElement[] | null;

  // Chamadas pelo provider (orquestração com react-query), não por consumidor de UI.
  resetForPresentation: (presentationId: string) => void;
  hydrate: (slides: AppPresentationsStudioSlide[]) => void;
  setHasHydrated: (value: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  reconcileCreatedSlides: (created: { tempId: string; id: string; outlineId: string; type: number }[]) => void;

  registerExcalidrawApi: (api: ExcalidrawImperativeAPI | null) => void;
  captureActiveSlideElements: () => void;
  setLiveActiveElements: (elements: readonly ExcalidrawElement[] | null) => void;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (id: string) => void;
  onReorderSlides: (activeId: string, overId: string) => void;
  onToggleHiddenSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onOpenPanel: (panel: StudioPanelKey) => void;
  onClosePanel: () => void;
}

// Store global (não por-componente) — o Studio inteiro roda com ele mesmo
// mounted globalmente em providers/app/index.tsx, então troca de presentation
// (navegação sem reload) precisa resetar explicitamente via resetForPresentation,
// não acontece sozinho como um useState de componente que desmonta.
export const useStudioStore = createAppStore<StudioStoreState>("studio", (set, get) => ({
  presentationId: "",
  slides: [],
  activeSlideId: "",
  isSaving: false,
  activePanel: null,
  hasHydrated: false,
  excalidrawApi: null,
  liveActiveElements: null,

  resetForPresentation: (presentationId) => {
    if (get().presentationId === presentationId) return;
    set({
      presentationId,
      slides: [],
      activeSlideId: "",
      isSaving: false,
      activePanel: null,
      hasHydrated: false,
      excalidrawApi: null,
      liveActiveElements: null,
    });
  },

  // Merge, nunca substitui — slideService().generate() persiste slide por
  // slide, em sequência (ver slide-service.ts), então o hook de hidratação
  // chama isso a cada poll com a lista mais recente do servidor, mesmo antes
  // de todos os slides existirem. Só adiciona os que ainda não estão na
  // store; nunca sobrescreve um slide já presente, senão apagaria edição ao
  // vivo do usuário (ex: ele já começou a editar a capa enquanto os outros
  // slides ainda geram). `hasHydrated` fica por conta de setHasHydrated —
  // quem decide que a geração terminou é o hook (compara contagem esperada).
  hydrate: (incoming) =>
    set((state) => {
      const existingIds = new Set(state.slides.map((s) => s.id));
      const toAdd = incoming.filter((s) => !existingIds.has(s.id));
      if (toAdd.length === 0) return state;

      const merged = [...state.slides, ...toAdd].sort((a, b) => a.order - b.order);
      return {
        slides: merged,
        activeSlideId: state.activeSlideId || merged[0]?.id || "",
      };
    }),

  setHasHydrated: (value) => set({ hasHydrated: value }),

  setIsSaving: (isSaving) => set({ isSaving }),

  // Chamado só pelo onSave() depois de persistir os slides que eram só locais
  // (isLocal) — troca o id de mentira (crypto.randomUUID() do onAddSlide) pelo
  // id real do banco, sem mexer em mais nada do slide (elements/scene já
  // continuam os mesmos). activeSlideId também precisa acompanhar a troca,
  // senão fica apontando pra um id que não existe mais em lugar nenhum.
  // `type` também vem do servidor aqui (não do onAddSlide) — é ele quem
  // decide cover vs. content (primeiro slide da presentation vira cover,
  // ver slide-service.ts createManual), então outlineType local (sempre
  // "content" até aqui) precisa ser corrigido pra travar a posição certo.
  reconcileCreatedSlides: (created) => {
    if (created.length === 0) return;
    const byTempId = new Map(created.map((c) => [c.tempId, c]));
    set((state) => ({
      slides: state.slides.map((slide) => {
        const match = byTempId.get(slide.id);
        if (!match) return slide;
        return { ...slide, id: match.id, outlineId: match.outlineId, outlineType: match.type, isLocal: false };
      }),
      activeSlideId: byTempId.get(state.activeSlideId)?.id ?? state.activeSlideId,
    }));
  },

  registerExcalidrawApi: (api) => set({ excalidrawApi: api }),

  captureActiveSlideElements: () => {
    const { excalidrawApi, activeSlideId } = get();
    if (!excalidrawApi) return;
    const elements = [...excalidrawApi.getSceneElements()];
    set((state) => ({
      slides: state.slides.map((slide) =>
        slide.id === activeSlideId
          ? { ...slide, scene: { ...slide.scene, elements } }
          : slide,
      ),
    }));
  },

  setLiveActiveElements: (elements) => set({ liveActiveElements: elements }),

  onSelectSlide: (id) => {
    if (id === get().activeSlideId) return;
    get().captureActiveSlideElements();
    set({ activeSlideId: id, liveActiveElements: null });
  },

  // Sem suporte no backend ainda pra inserir/remover/reordenar slide — fica só
  // local (mesmo tratamento combinado pro outline). Ver pm.md Backlog.
  // Insere antes do encerramento (se existir) — mesma regra do onAdd do
  // outline, senão "Adicionar slide" com um closing já na lista quebraria a
  // estrutura abertura→conteúdo→encerramento.
  onAddSlide: () =>
    set((state) => {
      const closingIndex = state.slides.findIndex((slide) => slide.outlineType === OutlineType.closing);
      const insertAt = closingIndex === -1 ? state.slides.length : closingIndex;
      const newSlide: AppPresentationsStudioSlide = {
        id: crypto.randomUUID(),
        order: insertAt,
        title: "Novo slide",
        scene: buildEmptyScene(),
        isLocal: true,
        outlineType: OutlineType.content,
      };
      const next = [...state.slides.slice(0, insertAt), newSlide, ...state.slides.slice(insertAt)];
      return { slides: next.map((slide, i) => ({ ...slide, order: i })) };
    }),

  onDuplicateSlide: (id) =>
    set((state) => {
      const index = state.slides.findIndex((slide) => slide.id === id);
      if (index === -1) return state;
      // Duplicata de cover/closing é sempre "content" — só pode haver uma
      // capa e um encerramento (mesma trava de posição abaixo depende disso).
      const duplicate = {
        ...state.slides[index],
        id: crypto.randomUUID(),
        isLocal: true,
        outlineType: OutlineType.content,
      };
      return {
        slides: [
          ...state.slides.slice(0, index + 1),
          duplicate,
          ...state.slides.slice(index + 1),
        ].map((slide, i) => ({ ...slide, order: i })),
      };
    }),

  // cover/closing têm posição fixa (primeiro/último) — mesma trava do
  // Outline (ver app-outline-store.ts:onReorder), agora replicada aqui pra
  // não ser possível embaralhar a estrutura só porque se está no Studio.
  onReorderSlides: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.slides.findIndex((slide) => slide.id === activeId);
      const newIndex = state.slides.findIndex((slide) => slide.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const active = state.slides[oldIndex];
      if (active.outlineType === OutlineType.cover || active.outlineType === OutlineType.closing) return state;

      const firstIsCover = state.slides[0]?.outlineType === OutlineType.cover;
      const lastIsClosing = state.slides[state.slides.length - 1]?.outlineType === OutlineType.closing;
      if (firstIsCover && newIndex === 0) return state;
      if (lastIsClosing && newIndex === state.slides.length - 1) return state;

      return {
        slides: arrayMove(state.slides, oldIndex, newIndex).map((slide, index) => ({
          ...slide,
          order: index,
        })),
      };
    }),

  onToggleHiddenSlide: (id) =>
    set((state) => ({
      slides: state.slides.map((slide) => (slide.id === id ? { ...slide, isHidden: !slide.isHidden } : slide)),
    })),

  onDeleteSlide: (id) => {
    const { slides, activeSlideId } = get();
    if (slides.length <= 1) return;
    const target = slides.find((slide) => slide.id === id);
    if (target?.outlineType === OutlineType.cover || target?.outlineType === OutlineType.closing) return;
    const remaining = slides.filter((slide) => slide.id !== id).map((slide, i) => ({ ...slide, order: i }));
    const nextActiveId = id === activeSlideId
      ? (slides.find((slide) => slide.id !== id)?.id ?? "")
      : activeSlideId;
    set({ slides: remaining, activeSlideId: nextActiveId });
  },

  onOpenPanel: (panel) => set((state) => ({ activePanel: state.activePanel === panel ? null : panel })),

  onClosePanel: () => set({ activePanel: null }),
}));

// Selector hooks granulares — cada consumidor só re-renderiza quando o slice
// específico que ele lê muda (ex: slide-list-header só lê `title`, via
// Context ainda, e nunca precisa re-renderizar durante edição no canvas — ver
// AppPresentationsStudioProvider). Esse era o problema real com Context puro:
// qualquer mudança de estado (arrastar forma, trocar slide) re-renderizava a
// árvore inteira do Studio. Ver docs/sdd/1-product/pm/decisions.md.
export function useStudioSlides() {
  return useStudioStore((s) => s.slides);
}

export function useStudioActiveSlideId() {
  return useStudioStore((s) => s.activeSlideId);
}

export function useStudioActiveSlide() {
  return useStudioStore((s) => s.slides.find((slide) => slide.id === s.activeSlideId) ?? s.slides[0] ?? EMPTY_SLIDE);
}

export function useStudioIsSaving() {
  return useStudioStore((s) => s.isSaving);
}

export function useStudioActivePanel() {
  return useStudioStore((s) => s.activePanel);
}

export function useStudioIsWaitingSlides() {
  return useStudioStore((s) => !s.hasHydrated);
}

// Elements pra prévia de UM slide da sidebar — se for o ativo e já tiver
// edição ao vivo (liveActiveElements), usa ela; senão cai pro scene.elements
// já capturado (slides inativos nunca mudam enquanto outro está sendo
// editado, então não precisam de nada "ao vivo").
export function useStudioSlidePreviewElements(slideId: string) {
  return useStudioStore((s) => {
    const slide = s.slides.find((sl) => sl.id === slideId);
    if (!slide) return [];
    if (slideId === s.activeSlideId && s.liveActiveElements) return s.liveActiveElements;
    return slide.scene.elements;
  });
}

// Ações são referências estáveis (definidas 1x na criação do store), mas o
// objeto que as agrupa é recriado a cada chamada — useShallow evita re-render
// por causa disso (compara campo a campo, não a referência do objeto todo).
export function useStudioActions() {
  return useStudioStore(
    useShallow((s) => ({
      registerExcalidrawApi: s.registerExcalidrawApi,
      setLiveActiveElements: s.setLiveActiveElements,
      onSelectSlide: s.onSelectSlide,
      onAddSlide: s.onAddSlide,
      onDuplicateSlide: s.onDuplicateSlide,
      onReorderSlides: s.onReorderSlides,
      onToggleHiddenSlide: s.onToggleHiddenSlide,
      onDeleteSlide: s.onDeleteSlide,
      onOpenPanel: s.onOpenPanel,
      onClosePanel: s.onClosePanel,
    })),
  );
}
