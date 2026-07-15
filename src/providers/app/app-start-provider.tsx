"use client";

import { useParams, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useState } from "react";

import { presentationActions } from "@/actions/app/app-presentation-actions";
import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import {
  PresentationAmount,
  PresentationAudience,
  PresentationScenario,
  PresentationTheme,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";

type PresentationTypeValue = (typeof PresentationType)[keyof typeof PresentationType];

interface AppStartControlValues {
  slideCount: number;
  language: number;
  aspectRatio: number;
}

interface AppStartContextProps {
  prompt: string;
  type: PresentationTypeValue;
  controls: AppStartControlValues;
  isSubmitting: boolean;
  onPromptChange: (value: string) => void;
  onTypeChange: (value: PresentationTypeValue) => void;
  onControlChange: (key: keyof AppStartControlValues, value: number) => void;
  onSubmit: () => void;
}

const AppStartContext = createContext<AppStartContextProps | undefined>(undefined);

export const AppStartProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const { useCreate } = useAppPresentation();
  const create = useCreate();

  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<PresentationTypeValue>(PresentationType.multi);
  const [controls, setControls] = useState<AppStartControlValues>({
    slideCount: 0,
    language: 0,
    aspectRatio: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onControlChange = (key: keyof AppStartControlValues, value: number) =>
    setControls((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { presentationId } = await create.mutateAsync({
        type,
        userPrompt: prompt,
        language: controls.language,
        aspectRatio: controls.aspectRatio,
        slideCount: controls.slideCount,
        amount: PresentationAmount.auto,
        audience: PresentationAudience.general,
        scenario: PresentationScenario.auto,
        theme: PresentationTheme.daktilo,
      });

      // O id só existe depois do create resolver — chama a action direto (não o hook,
      // que já teria sido criado nesse render sem o id) pra evitar closure com id velho.
      await presentationActions().generateOutline(presentationId, {
        userPrompt: prompt,
        language: controls.language,
        slideCount: controls.slideCount,
      });

      // useRouter/Link de "@/i18n/navigation" dependem do NextIntlClientProvider, que só
      // existe dentro de app/[lang]/layout.tsx — este provider é montado acima disso na
      // árvore (via Providers em app/layout.tsx), por isso usa o router puro do Next e
      // prefixa o locale manualmente.
      router.push(`/${lang}/app/presentations/${presentationId}/outline`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const value: AppStartContextProps = {
    prompt,
    type,
    controls,
    isSubmitting,
    onPromptChange: setPrompt,
    onTypeChange: setType,
    onControlChange,
    onSubmit,
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
