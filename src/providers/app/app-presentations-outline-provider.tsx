"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { createContext, ReactNode, useContext, useState } from "react";

import { OutlineRepresentation, OutlineType } from "@/lib/drizzle/schema/outline";
import {
  AspectRatio,
  PresentationAmount,
  PresentationAudience,
  PresentationLanguage,
  PresentationScenario,
  PresentationTheme,
} from "@/lib/drizzle/schema/presentation";

import type { AppPresentationsOutlineCardItem } from "@/components/app/presentations/outline/app-presentations-outline-card";
import type { AppPresentationsOutlineParams } from "@/components/app/presentations/outline/outline-enum-labels";

const MOCK_TITLE = "Microsserviços na Nuvem";

const MOCK_PROMPT =
  "Crie uma apresentação sobre arquitetura de microsserviços na nuvem, cobrindo os problemas dos monólitos, padrões de comunicação entre serviços e observabilidade.";

const MOCK_PARAMS: AppPresentationsOutlineParams = {
  language: PresentationLanguage.ptBR,
  aspectRatio: AspectRatio["16:9"],
  slideCount: 0,
  audience: PresentationAudience.general,
  scenario: PresentationScenario.auto,
  amount: PresentationAmount.minimal,
  theme: PresentationTheme.daktilo,
};

const MOCK_OUTLINES: AppPresentationsOutlineCardItem[] = [
  {
    id: "o1",
    order: 0,
    type: OutlineType.cover,
    title: "Microsserviços na Nuvem",
    description: "Visão geral da arquitetura distribuída moderna e seus principais benefícios para equipes de engenharia.",
    concepts: ["cloud", "microservices", "distributed"],
    representation: OutlineRepresentation.auto,
  },
  {
    id: "o2",
    order: 1,
    type: OutlineType.content,
    title: "O problema com monólitos",
    description: "Como aplicações monolíticas criam gargalos de deploy, escalabilidade e desenvolvimento independente.",
    concepts: ["monolith", "scalability", "deploy bottleneck"],
    representation: OutlineRepresentation.flowchart,
  },
  {
    id: "o3",
    order: 2,
    type: OutlineType.content,
    title: "Comunicação entre serviços",
    description: "Padrões de comunicação síncrona (REST/gRPC) e assíncrona (eventos/mensageria) entre microsserviços.",
    concepts: ["REST", "gRPC", "events", "message queue"],
    representation: OutlineRepresentation.sequence,
  },
  {
    id: "o4",
    order: 3,
    type: OutlineType.content,
    title: "Observabilidade e resiliência",
    description: "Estratégias para monitorar, rastrear e garantir a saúde do sistema distribuído em produção.",
    concepts: ["tracing", "metrics", "circuit breaker", "retry"],
    representation: OutlineRepresentation.architecture,
  },
  {
    id: "o5",
    order: 4,
    type: OutlineType.closing,
    title: "Próximos passos",
    description: "Roteiro de migração incremental e recomendações para adoção gradual da arquitetura de microsserviços.",
    concepts: ["migration", "roadmap", "incremental"],
    representation: OutlineRepresentation.auto,
  },
];

interface AppPresentationsOutlineContextProps {
  title: string;
  outlines: AppPresentationsOutlineCardItem[];
  prompt: string;
  params: AppPresentationsOutlineParams;
  isGenerating: boolean;
  isRegeneratingAll: boolean;
  regeneratingCardId: string | null;
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
  const [outlines, setOutlines] = useState<AppPresentationsOutlineCardItem[]>(MOCK_OUTLINES);
  const [prompt, setPrompt] = useState(MOCK_PROMPT);
  const [params, setParams] = useState<AppPresentationsOutlineParams>(MOCK_PARAMS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [regeneratingCardId, setRegeneratingCardId] = useState<string | null>(null);

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
      return arrayMove(prev, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));
    });
  };

  const onDelete = (id: string) =>
    setOutlines((prev) =>
      prev.filter((o) => o.id !== id).map((item, index) => ({ ...item, order: index })),
    );

  const onAdd = () =>
    setOutlines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        order: prev.length,
        type: OutlineType.content,
        title: "",
        description: "",
        concepts: [],
        representation: OutlineRepresentation.auto,
      },
    ]);

  const onRegenerateCard = (id: string) => {
    setRegeneratingCardId(id);
    setTimeout(() => setRegeneratingCardId(null), 1500);
  };

  const onParamChange = (key: keyof AppPresentationsOutlineParams, value: number) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const onRegenerateAll = () => {
    setIsRegeneratingAll(true);
    setTimeout(() => setIsRegeneratingAll(false), 2000);
  };

  const onGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const value: AppPresentationsOutlineContextProps = {
    title: MOCK_TITLE,
    outlines,
    prompt,
    params,
    isGenerating,
    isRegeneratingAll,
    regeneratingCardId,
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