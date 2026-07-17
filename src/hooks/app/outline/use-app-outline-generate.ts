"use client";

import { useRouter } from "next/navigation";

import { useAppOutline } from "@/hooks/app/use-app-outline";
import { useAppSlide } from "@/hooks/app/use-app-slide";
import { useOutlineStore } from "@/store/app-outline-store";

// Submit final: persiste os outlines (bulk-update), dispara a geração dos
// slides e navega pro Studio.
export function useAppOutlineGenerate(presentationId: string, lang: string) {
  const router = useRouter();
  const { useBulkUpdate } = useAppOutline();
  const { useGenerate: useGenerateSlides } = useAppSlide();
  const bulkUpdate = useBulkUpdate(presentationId);
  const generateSlides = useGenerateSlides(presentationId);
  const setIsGenerating = useOutlineStore((s) => s.setIsGenerating);

  const onGenerate = async () => {
    setIsGenerating(true);
    try {
      const persisted = useOutlineStore.getState().outlines.filter((o) => !o.isLocal);

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
      // existe dentro de app/[lang]/layout.tsx — este hook é usado num provider montado
      // acima disso na árvore (via Providers em app/layout.tsx), por isso usa o router puro
      // do Next e prefixa o locale manualmente.
      router.push(`/${lang}/app/presentations/${presentationId}/studio`);
    } finally {
      setIsGenerating(false);
    }
  };

  return { onGenerate };
}
