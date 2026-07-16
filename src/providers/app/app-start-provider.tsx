"use client";

import { useParams, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useState } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import type { z } from "zod";

import { attachmentActions } from "@/actions/app/attachment-actions";
import { presentationActions } from "@/actions/app/app-presentation-actions";
import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { useForm } from "@/hooks/use-form";
import {
  PresentationAmount,
  PresentationAudience,
  PresentationScenario,
  PresentationTheme,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";
import { MAX_ATTACHMENTS_PER_PRESENTATION } from "@/schemas/app/attachment-schema";
import { LOCALE_TO_LANGUAGE, presentationCreateSchema, type PresentationCreate } from "@/schemas/app/presentation-schema";
import type { PresentationEntrySuggestion } from "@/schemas/app/presentation-entry-schema";

// presentationCreateSchema tem campo com `.default()` (type, language, amount...)
// — entrada (o que o form guarda enquanto o usuário digita, antes do resolver
// rodar) é mais "solta" (`number | undefined`) que a saída validada
// (`PresentationCreate`, sempre `number`). register/control/errors trabalham
// sobre a entrada; mutationFn recebe a saída já validada (ver hooks/use-form.ts).
type PresentationCreateInput = z.input<typeof presentationCreateSchema>;

export type AppStartAttachmentType = "image" | "file" | "link";

export interface AppStartAttachment {
  id: string;
  type: AppStartAttachmentType;
  name: string;
  value: File | string;
}

interface AppStartContextProps {
  register: UseFormRegister<PresentationCreateInput>;
  control: Control<PresentationCreateInput>;
  errors: FieldErrors<PresentationCreateInput>;
  type: PresentationCreateInput["type"];
  language: number;
  prompt: string;
  attachments: AppStartAttachment[];
  isSubmitting: boolean;
  selectedSuggestionId: string | null;
  onAddAttachment: (type: AppStartAttachmentType, value: File | string) => void;
  onRemoveAttachment: (id: string) => void;
  onSelectSuggestion: (entry: PresentationEntrySuggestion) => void;
  onSuggestionFieldEdit: () => void;
  onSubmit: () => void;
}

const AppStartContext = createContext<AppStartContextProps | undefined>(undefined);

export const AppStartProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const { useCreate } = useAppPresentation();
  const create = useCreate();

  const [attachments, setAttachments] = useState<AppStartAttachment[]>([]);
  // Presente só enquanto a suggestion clicada não foi editada (ver
  // onSuggestionFieldEdit) — usado no submit só pra decidir se registra um
  // presentation_entry novo (kind=custom), nunca pra validar/bloquear nada.
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  const { register, control, watch, setValue, formState, handleSubmit } = useForm<
    PresentationCreateInput,
    { presentationId: string },
    PresentationCreate
  >({
    schema: presentationCreateSchema,
    // Só valida no clique de criar (não a cada tecla) — depois do 1º submit com
    // erro, o RHF revalida em onChange por padrão, então o erro some assim que
    // o campo for corrigido, sem precisar clicar de novo.
    mode: "onSubmit",
    defaultValues: {
      type: PresentationType.multi,
      userPrompt: "",
      language: 0,
      aspectRatio: 0,
      // slideCount é o valor real (não índice/enum) — "Automático" foi removido do
      // controle porque não havia garantia de mínimo de slides, 5 é o piso seguro.
      slideCount: 5,
      amount: PresentationAmount.auto,
      audience: PresentationAudience.general,
      scenario: PresentationScenario.auto,
      theme: PresentationTheme.daktilo,
    },
    mutationFn: async (data) => {
      const { presentationId } = await create.mutateAsync({
        ...data,
        sourceEntryId: selectedSuggestionId ?? undefined,
      });

      // Upload adiado até aqui (presentation só existe agora) — em paralelo, direto
      // pro Postgres (não é R2, ver pm/decisions.md). Falha de anexo não deve travar
      // a criação da apresentação — capturada e ignorada individualmente.
      if (attachments.length > 0) {
        await Promise.all(
          attachments.map((attachment) =>
            attachment.type === "link"
              ? attachmentActions().createLink(presentationId, {
                  name: attachment.name,
                  url: attachment.value as string,
                })
              : attachmentActions().uploadFile(presentationId, attachment.type, attachment.value as File),
          ),
        ).catch((err) => console.warn("[app-start] falha ao subir anexo(s)", err));
      }

      // O id só existe depois do create resolver — chama a action direto (não o hook,
      // que já teria sido criado nesse render sem o id) pra evitar closure com id velho.
      await presentationActions().generateOutline(presentationId, {
        userPrompt: data.userPrompt ?? "",
        language: data.language,
        slideCount: data.slideCount,
      });

      return { presentationId };
    },
    onSuccess: ({ presentationId }) => {
      // useRouter/Link de "@/i18n/navigation" dependem do NextIntlClientProvider, que só
      // existe dentro de app/[lang]/layout.tsx — este provider é montado acima disso na
      // árvore (via Providers em app/layout.tsx), por isso usa o router puro do Next e
      // prefixa o locale manualmente.
      router.push(`/${lang}/app/presentations/${presentationId}/outline`);
    },
  });

  const type = watch("type");
  const prompt = watch("userPrompt") ?? "";
  // Idioma do app (rota [lang]) -> enum PresentationLanguage, usado pra filtrar
  // suggestions. Só pt-BR ativo hoje, mas o mapa já é multi-idioma (ver
  // presentation-schema.ts).
  const language = LOCALE_TO_LANGUAGE[lang] ?? LOCALE_TO_LANGUAGE["pt-BR"];

  const onSelectSuggestion = (entry: PresentationEntrySuggestion) => {
    setValue("userPrompt", entry.prompt);
    setValue("aspectRatio", entry.aspectRatio);
    setValue("amount", entry.amount);
    setValue("audience", entry.audience);
    setValue("scenario", entry.scenario);
    setValue("theme", entry.theme);
    setSelectedSuggestionId(entry.id);
  };

  // Qualquer edição manual num campo que a suggestion preencheu desfaz o
  // vínculo — sem isso, um submit editado ainda seria contado como "veio de
  // suggestion sem edição" e nunca viraria um presentation_entry (kind=custom).
  const onSuggestionFieldEdit = () => setSelectedSuggestionId(null);

  // Fica só em memória até o submit — presentation ainda não existe nesse
  // momento (upload adiado, ver pm/decisions.md "Anexos do /app/start").
  // Limite é checagem de UX só — quem vale de verdade é o servidor
  // (attachment-service.ts), que rejeitaria mesmo se isso aqui não existisse.
  const onAddAttachment = (type: AppStartAttachmentType, value: File | string) =>
    setAttachments((prev) => {
      if (prev.length >= MAX_ATTACHMENTS_PER_PRESENTATION) return prev;
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          type,
          name: value instanceof File ? value.name : value,
          value,
        },
      ];
    });

  const onRemoveAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));

  const value: AppStartContextProps = {
    register,
    control,
    errors: formState.errors,
    type,
    language,
    prompt,
    attachments,
    isSubmitting: formState.isSubmitting,
    selectedSuggestionId,
    onAddAttachment,
    onRemoveAttachment,
    onSelectSuggestion,
    onSuggestionFieldEdit,
    onSubmit: handleSubmit,
  };

  return (
    <AppStartContext.Provider value={value}>
      {children}
    </AppStartContext.Provider>
  );
};

export const useAppStart = () => {
  const context = useContext(AppStartContext);
  if (context === undefined) {
    throw new Error("useAppStart must be used within an AppStartProvider");
  }
  return context;
};
