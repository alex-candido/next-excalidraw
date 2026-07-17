"use client";

import { useRef, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { z } from "zod";

import type { presentationCreateSchema } from "@/schemas/app/presentation-schema";
import type { PresentationEntrySuggestion } from "@/schemas/app/presentation-entry-schema";

type PresentationCreateInput = z.input<typeof presentationCreateSchema>;

// Seleção de suggestion (preenche os campos do form) + animação de "digitando"
// no prompt. selectedSuggestionId só existe enquanto os campos preenchidos
// pela suggestion não forem editados manualmente (onSuggestionFieldEdit
// desfaz o vínculo) — usado no submit só pra decidir se registra um
// presentation_entry novo (kind=custom), nunca pra validar/bloquear nada.
export function useAppStartSuggestionFill(setValue: UseFormSetValue<PresentationCreateInput>) {
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onSelectSuggestion = (entry: PresentationEntrySuggestion) => {
    setValue("aspectRatio", entry.aspectRatio);
    setValue("slideCount", entry.slideCount);
    setValue("amount", entry.amount);
    setValue("audience", entry.audience);
    setValue("scenario", entry.scenario);
    setValue("theme", entry.theme);
    if (entry.keywords?.length) setValue("keywords", entry.keywords);
    setSelectedSuggestionId(entry.id);

    // Efeito de "digitando" no textarea — reforça visualmente que o prompt
    // veio de uma suggestion. Clicar em outra suggestion no meio da animação
    // cancela a anterior e começa do zero (por isso o ref, não um simples let).
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    const text = entry.prompt;
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      i += 3;
      setValue("userPrompt", text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typingIntervalRef.current!);
        typingIntervalRef.current = null;
      }
    }, 12);
  };

  // Qualquer edição manual num campo que a suggestion preencheu desfaz o
  // vínculo — sem isso, um submit editado ainda seria contado como "veio de
  // suggestion sem edição" e nunca viraria um presentation_entry (kind=custom).
  const onSuggestionFieldEdit = () => setSelectedSuggestionId(null);

  return { selectedSuggestionId, onSelectSuggestion, onSuggestionFieldEdit };
}
