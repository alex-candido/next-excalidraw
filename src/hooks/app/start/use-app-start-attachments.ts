"use client";

import { useState } from "react";

import { MAX_ATTACHMENTS_PER_PRESENTATION } from "@/schemas/app/attachment-schema";

export type AppStartAttachmentType = "image" | "file" | "link";

export interface AppStartAttachment {
  id: string;
  type: AppStartAttachmentType;
  name: string;
  value: File | string;
}

// Fica só em memória até o submit — presentation ainda não existe nesse
// momento (upload adiado, ver pm/decisions.md "Anexos do /app/start"). Limite
// é checagem de UX só — quem vale de verdade é o servidor (attachment-service.ts).
export function useAppStartAttachments() {
  const [attachments, setAttachments] = useState<AppStartAttachment[]>([]);

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

  return { attachments, onAddAttachment, onRemoveAttachment };
}
