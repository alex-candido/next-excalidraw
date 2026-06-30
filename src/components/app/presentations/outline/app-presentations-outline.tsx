"use client";

import { useState } from "react";

import { OutlineRepresentation, OutlineType } from "@/lib/drizzle/schema/outline";

import { AppPresentationsOutlineHero } from "@/components/app/presentations/outline/app-presentations-outline-hero";
import { AppPresentationsOutlineList } from "@/components/app/presentations/outline/app-presentations-outline-list";
import type { AppPresentationsOutlineCardItem } from "@/components/app/presentations/outline/app-presentations-outline-card";

const MOCK_TITLE = "Microsserviços na Nuvem";

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

interface AppPresentationsOutlineProps {
  presentationId: string;
}

export function AppPresentationsOutline({ presentationId: _ }: AppPresentationsOutlineProps) {
  const [outlines, setOutlines] = useState<AppPresentationsOutlineCardItem[]>(MOCK_OUTLINES);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTitleChange = (id: string, value: string) =>
    setOutlines((prev) => prev.map((o) => (o.id === id ? { ...o, title: value } : o)));

  const handleDescriptionChange = (id: string, value: string) =>
    setOutlines((prev) => prev.map((o) => (o.id === id ? { ...o, description: value } : o)));

  const handleRepresentationChange = (id: string, value: number) =>
    setOutlines((prev) => prev.map((o) => (o.id === id ? { ...o, representation: value } : o)));

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="app-presentations-outline">
      <AppPresentationsOutlineHero
        title={MOCK_TITLE}
        count={outlines.length}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-20">
        <AppPresentationsOutlineList
          outlines={outlines}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onRepresentationChange={handleRepresentationChange}
        />
      </div>
    </div>
  );
}
