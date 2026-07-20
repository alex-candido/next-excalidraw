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
  // Mesmo campo do Outline (outline.type), mas sempre derivado da posição no
  // array (ver deriveSlideTypes) — nunca lido/escrito diretamente fora dela.
  outlineType?: number;
  // Vem do outline pareado (outline.representation), só pra exibir o ícone
  // na slide list — nunca editado aqui (representação só muda no Outline).
  representation?: number;
}

export type StudioPanelKey = "settings" | "templates" | "assistant" | "source" | "history";

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

// Mesma regra do Outline (ver MIN_OUTLINES/deriveTypes em app-outline-store.ts):
// outlineType não é mais fixo por item, é derivado da posição a cada
// reorder/add/delete/hydrate. Único limite que resta: nunca menos que
// MIN_SLIDES (garante 1 capa + 1 conteúdo + 1 encerramento sempre existindo).
export const MIN_SLIDES = 3;

function deriveSlideTypes(slides: AppPresentationsStudioSlide[]): AppPresentationsStudioSlide[] {
  return slides.map((slide, index) => ({
    ...slide,
    order: index,
    outlineType: index === 0 ? OutlineType.cover : index === slides.length - 1 ? OutlineType.closing : OutlineType.content,
  }));
}

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
  // Slides removidos localmente (onDeleteSlide) que já existiam no banco —
  // só pra mandar no próximo Save (ver use-app-studio-save.ts). Nunca inclui
  // slide isLocal (nunca existiu no banco, não tem o que apagar lá).
  deletedSlideIds: Set<string>;

  // Chamadas pelo provider (orquestração com react-query), não por consumidor de UI.
  resetForPresentation: (presentationId: string) => void;
  hydrate: (slides: AppPresentationsStudioSlide[]) => void;
  setHasHydrated: (value: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  clearDeletedSlideIds: () => void;
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
  deletedSlideIds: new Set(),

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
      deletedSlideIds: new Set(),
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
        slides: deriveSlideTypes(merged),
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
  // outlineType não depende mais do que o servidor decidiu — deriveSlideTypes
  // recalcula pela posição atual do array, que já estava certa desde o
  // onAddSlide (inserido antes do encerramento).
  reconcileCreatedSlides: (created) => {
    if (created.length === 0) return;
    const byTempId = new Map(created.map((c) => [c.tempId, c]));
    set((state) => ({
      slides: deriveSlideTypes(state.slides.map((slide) => {
        const match = byTempId.get(slide.id);
        if (!match) return slide;
        return { ...slide, id: match.id, outlineId: match.outlineId, isLocal: false };
      })),
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
  // Insere antes do encerramento (se existir) — senão "Adicionar slide"
  // nasceria depois do item que vai virar encerramento. outlineType real
  // vem do deriveSlideTypes, não precisa fixar na mão.
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
      };
      const next = [...state.slides.slice(0, insertAt), newSlide, ...state.slides.slice(insertAt)];
      return { slides: deriveSlideTypes(next) };
    }),

  onDuplicateSlide: (id) =>
    set((state) => {
      const index = state.slides.findIndex((slide) => slide.id === id);
      if (index === -1) return state;
      const duplicate = { ...state.slides[index], id: crypto.randomUUID(), isLocal: true };
      return {
        slides: deriveSlideTypes([
          ...state.slides.slice(0, index + 1),
          duplicate,
          ...state.slides.slice(index + 1),
        ]),
      };
    }),

  // Reorder é sempre livre — não existe mais slide travado por posição.
  // outlineType é recalculado pra todo mundo depois (ver deriveSlideTypes):
  // quem cair na posição 0/última vira a capa/encerramento nova.
  onReorderSlides: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.slides.findIndex((slide) => slide.id === activeId);
      const newIndex = state.slides.findIndex((slide) => slide.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      return { slides: deriveSlideTypes(arrayMove(state.slides, oldIndex, newIndex)) };
    }),

  onToggleHiddenSlide: (id) =>
    set((state) => ({
      slides: state.slides.map((slide) => (slide.id === id ? { ...slide, isHidden: !slide.isHidden } : slide)),
    })),

  // Única regra que resta: nunca menos que MIN_SLIDES (garante 1 capa + 1
  // conteúdo + 1 encerramento sempre existindo) — não importa mais qual
  // slide está sendo apagado, cover/closing incluídos.
  onDeleteSlide: (id) => {
    const { slides, activeSlideId, deletedSlideIds } = get();
    if (slides.length <= MIN_SLIDES) return;
    const target = slides.find((slide) => slide.id === id);
    const remaining = deriveSlideTypes(slides.filter((slide) => slide.id !== id));
    const nextActiveId = id === activeSlideId
      ? (slides.find((slide) => slide.id !== id)?.id ?? "")
      : activeSlideId;
    // isLocal nunca existiu no banco — nada a marcar pra apagar no Save.
    const nextDeletedIds = target && !target.isLocal
      ? new Set(deletedSlideIds).add(id)
      : deletedSlideIds;
    set({ slides: remaining, activeSlideId: nextActiveId, deletedSlideIds: nextDeletedIds });
  },

  clearDeletedSlideIds: () => set({ deletedSlideIds: new Set() }),

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

// Regra é sempre a mesma pra todo mundo (não é por item) — um hook só, os
// itens da slide list leem direto em vez de receber via prop.
export function useStudioCanDelete() {
  return useStudioStore((s) => s.slides.length > MIN_SLIDES);
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
