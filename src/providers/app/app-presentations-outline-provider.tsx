"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { useParams, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

import { useAppOutline } from "@/hooks/app/use-app-outline";
import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { useAppSlide } from "@/hooks/app/use-app-slide";
import { PresentationStatus } from "@/lib/drizzle/schema/presentation";

import type { AppPresentationsOutlineCardItem } from "@/components/app/presentations/outline/app-presentations-outline-card";
import type { AppPresentationsOutlineParams } from "@/components/app/presentations/outline/outline-enum-labels";

const POLL_INTERVAL_MS = 3000;

interface OutlineCardState extends AppPresentationsOutlineCardItem {
  layout: string;
  updatedAt?: string;
  isLocal?: boolean;
}

interface AppPresentationsOutlineContextProps {
  title: string;
  outlines: AppPresentationsOutlineCardItem[];
  prompt: string;
  params: AppPresentationsOutlineParams;
  isLoading: boolean;
  isGeneratingInitial: boolean;
  isGenerating: boolean;
  isRegeneratingAll: boolean;
  regeneratingIds: Set<string>;
  onPromptChange: (value: string) => void;
  onParamChange: (key: keyof AppPresentationsOutlineParams, value: number) => void;
  onTitleChange: (id: string, value: string) => void;
  onDescriptionChange: (id: string, value: string) => void;
  onRepresentationChange: (id: string, value: number) => void;
  onReorder: (activeId: string, overId: string) => void;
  onRegenerateCard: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onRegenerateAll: () => void;
  onGenerate: () => void;
}

const AppPresentationsOutlineContext = createContext<AppPresentationsOutlineContextProps | undefined>(undefined);

export const AppPresentationsOutlineProvider = ({ children }: { children: ReactNode }) => {
  const routeParams = useParams<{ id?: string; lang?: string }>();
  const presentationId = routeParams.id ?? "";
  const lang = routeParams.lang ?? "";
  const router = useRouter();

  const { useDetail } = useAppPresentation();
  const { useBulkUpdate, useRegenerate } = useAppOutline();
  const { useGenerate: useGenerateSlides } = useAppSlide();

  const [outlines, setOutlines] = useState<OutlineCardState[]>([]);
  const [prompt, setPrompt] = useState("");
  const [params, setParams] = useState<AppPresentationsOutlineParams>({
    language: 0, aspectRatio: 0, slideCount: 0, audience: 0, scenario: 0, amount: 0, theme: 0,
  });
  const [hasHydrated, setHasHydrated] = useState(false);
  const [waitingIds, setWaitingIds] = useState<Set<string>>(new Set());
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const waitingSince = useRef<Map<string, string | undefined>>(new Map());

  // Presentation recém-criada (dashboard) começa em draft, sem outlines, com a geração
  // inicial ainda rodando em background (Inngest) — continua pollando até ela terminar,
  // em vez de hidratar uma vez só com array vazio.
  const { data: presentation, isLoading } = useDetail(presentationId, {
    refetchInterval: (data) => {
      if (waitingIds.size > 0) return POLL_INTERVAL_MS;
      if (!hasHydrated && data && data.status === PresentationStatus.draft && data.outlines.length === 0) {
        return POLL_INTERVAL_MS;
      }
      return false;
    },
  });
  const isWaitingInitialGeneration =
    !hasHydrated && !!presentation && presentation.status === PresentationStatus.draft && presentation.outlines.length === 0;
  const bulkUpdate = useBulkUpdate(presentationId);
  const regenerate = useRegenerate(presentationId);
  const generateSlides = useGenerateSlides(presentationId);

  useEffect(() => {
    if (!presentation || hasHydrated || isWaitingInitialGeneration) return;

    setOutlines(
      presentation.outlines.map((o) => ({
        id: o.id,
        order: o.order,
        type: o.type,
        title: o.title,
        description: o.description ?? "",
        concepts: o.concepts ?? [],
        representation: o.representation,
        layout: o.layout ?? "",
        updatedAt: o.updatedAt,
      })),
    );
    setPrompt(presentation.userPrompt ?? "");
    setParams({
      language: presentation.language,
      aspectRatio: presentation.aspectRatio,
      slideCount: presentation.slideCount,
      audience: presentation.audience,
      scenario: presentation.scenario,
      amount: presentation.amount,
      theme: presentation.theme,
    });
    setHasHydrated(true);
  }, [presentation, hasHydrated]);

  // Enquanto algum outline está "regenerando", o poll acima refaz o fetch — aqui a gente
  // detecta se o updatedAt daquele outline específico mudou e só então aplica o resultado,
  // sem sobrescrever o array inteiro (perderia reorder/delete/add locais dos outros cards).
  useEffect(() => {
    if (!presentation || waitingIds.size === 0) return;

    setOutlines((prev) =>
      prev.map((card) => {
        if (!waitingIds.has(card.id)) return card;

        const fresh = presentation.outlines.find((o) => o.id === card.id);
        if (!fresh) return card;

        const startedAt = waitingSince.current.get(card.id);
        if (fresh.updatedAt === startedAt) return card;

        waitingSince.current.delete(card.id);
        setWaitingIds((prevIds) => {
          const next = new Set(prevIds);
          next.delete(card.id);
          return next;
        });

        return {
          ...card,
          title: fresh.title,
          description: fresh.description ?? "",
          concepts: fresh.concepts ?? [],
          representation: fresh.representation,
          layout: fresh.layout ?? "",
          updatedAt: fresh.updatedAt,
        };
      }),
    );
  }, [presentation, waitingIds]);

  const onTitleChange = (id: string, value: string) =>
    setOutlines((prev) => prev.map((o) => (o.id === id ? { ...o, title: value } : o)));

  const onDescriptionChange = (id: string, value: string) =>
    setOutlines((prev) => prev.map((o) => (o.id === id ? { ...o, description: value } : o)));

  const onRepresentationChange = (id: string, value: number) =>
    setOutlines((prev) => prev.map((o) => (o.id === id ? { ...o, representation: value } : o)));

  const onReorder = (activeId: string, overId: string) => {
    setOutlines((prev) => {
      const oldIndex = prev.findIndex((o) => o.id === activeId);
      const newIndex = prev.findIndex((o) => o.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((item, index) => ({ ...item, order: index }));
    });
  };

  const onDelete = (id: string) =>
    setOutlines((prev) => prev.filter((o) => o.id !== id).map((item, index) => ({ ...item, order: index })));

  const onAdd = () =>
    setOutlines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        order: prev.length,
        type: 1,
        title: "",
        description: "",
        concepts: [],
        representation: 0,
        layout: "",
        isLocal: true,
      },
    ]);

  const onParamChange = (key: keyof AppPresentationsOutlineParams, value: number) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const onRegenerateCard = async (id: string) => {
    const outline = outlines.find((o) => o.id === id);
    if (!outline || outline.isLocal) return;

    waitingSince.current.set(id, outline.updatedAt);
    setWaitingIds((prev) => new Set(prev).add(id));

    try {
      await regenerate.mutateAsync({
        outlineId: id,
        input: { userPrompt: prompt, language: params.language, type: outline.type, order: outline.order },
      });
    } catch {
      waitingSince.current.delete(id);
      setWaitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const onRegenerateAll = async () => {
    setIsRegeneratingAll(true);
    try {
      await Promise.all(outlines.filter((o) => !o.isLocal).map((o) => onRegenerateCard(o.id)));
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  const onGenerate = async () => {
    setIsGenerating(true);
    try {
      const persisted = outlines.filter((o) => !o.isLocal);

      await bulkUpdate.mutateAsync({
        outlines: persisted.map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
          representation: o.representation,
        })),
      });

      await generateSlides.mutateAsync({
        outlines: persisted.map((o) => ({
          outlineId: o.id,
          type: o.type,
          title: o.title,
          description: o.description,
          concepts: o.concepts,
          representation: o.representation,
          layout: o.layout,
        })),
      });

      // useRouter/Link de "@/i18n/navigation" dependem do NextIntlClientProvider, que só
      // existe dentro de app/[lang]/layout.tsx — este provider é montado acima disso na
      // árvore (via Providers em app/layout.tsx), por isso usa o router puro do Next e
      // prefixa o locale manualmente.
      router.push(`/${lang}/app/presentations/${presentationId}/studio`);
    } finally {
      setIsGenerating(false);
    }
  };

  const value: AppPresentationsOutlineContextProps = {
    title: presentation?.title ?? "",
    outlines,
    prompt,
    params,
    isLoading,
    isGeneratingInitial: isWaitingInitialGeneration,
    isGenerating,
    isRegeneratingAll,
    regeneratingIds: waitingIds,
    onPromptChange: setPrompt,
    onParamChange,
    onTitleChange,
    onDescriptionChange,
    onRepresentationChange,
    onReorder,
    onRegenerateCard,
    onDelete,
    onAdd,
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
