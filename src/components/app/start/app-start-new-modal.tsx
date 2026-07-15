"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import {
  PresentationAmount,
  PresentationAudience,
  PresentationLanguage,
  PresentationScenario,
  PresentationTheme,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";

import { AppStartNewModalActions } from "@/components/app/start/app-start-new-modal-actions";
import { AppStartNewModalEngine } from "@/components/app/start/app-start-new-modal-engine";
import { AppStartNewModalFeatures } from "@/components/app/start/app-start-new-modal-features";
import { AppStartNewModalType } from "@/components/app/start/app-start-new-modal-type";

type PresentationTypeValue =
  (typeof PresentationType)[keyof typeof PresentationType];

interface AppStartNewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppStartNewModal({
  open,
  onOpenChange,
}: AppStartNewModalProps) {
  const t = useTranslations("app.new");
  const router = useRouter();
  const { useCreate } = useAppPresentation();
  const create = useCreate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<PresentationTypeValue>(
    PresentationType.multi,
  );

  async function handleCreate() {
    const { presentationId } = await create.mutateAsync({
      type,
      title,
      language: PresentationLanguage.en,
      aspectRatio: 0,
      slideCount: 0,
      amount: PresentationAmount.auto,
      audience: PresentationAudience.general,
      scenario: PresentationScenario.auto,
      theme: PresentationTheme.daktilo,
    });
    onOpenChange(false);
    router.push(`/app/presentations/${presentationId}/studio`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-start-new-modal sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="app-start-new-modal-heading">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="app-start-new-modal-body flex flex-col gap-3">
          <div className="app-start-new-modal-field-title">
            <Input
              placeholder={t("fields.title.placeholder")}
              className="app-start-new-modal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <AppStartNewModalEngine />
          <AppStartNewModalType value={type} onChange={setType} />
          <AppStartNewModalFeatures />
        </div>

        <AppStartNewModalActions
          onCancel={() => onOpenChange(false)}
          onCreate={handleCreate}
          isSubmitting={create.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
