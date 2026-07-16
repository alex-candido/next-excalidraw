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
import { presentationCreateSchema, type PresentationCreate } from "@/schemas/app/presentation-schema";

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
  prompt: string;
  attachments: AppStartAttachment[];
  isSubmitting: boolean;
  onAddAttachment: (type: AppStartAttachmentType, value: File | string) => void;
  onRemoveAttachment: (id: string) => void;
  onSubmit: () => void;
}

const AppStartContext = createContext<AppStartContextProps | undefined>(undefined);

export const AppStartProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const { useCreate } = useAppPresentation();
  const create = useCreate();

  const [attachments, setAttachments] = useState<AppStartAttachment[]>([]);

  const { register, control, watch, formState, handleSubmit } = useForm<
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
      const { presentationId } = await create.mutateAsync(data);

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
    prompt,
    attachments,
    isSubmitting: formState.isSubmitting,
    onAddAttachment,
    onRemoveAttachment,
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
