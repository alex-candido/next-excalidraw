"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { attachmentActions } from "@/actions/app/attachment-actions";
import type { AttachmentCreateLink } from "@/schemas/app/attachment-schema";

export const appAttachmentKeys = {
  list: (presentationId: string) => ["attachments", presentationId] as const,
};

export function useAppAttachment() {
  const queryClient = useQueryClient();

  function useList(presentationId: string) {
    return useQuery({
      queryKey: appAttachmentKeys.list(presentationId),
      queryFn: () => attachmentActions().list(presentationId),
      enabled: !!presentationId,
    });
  }

  function useUploadFile(presentationId: string) {
    return useMutation({
      mutationFn: ({ kind, file }: { kind: "image" | "file"; file: File }) =>
        attachmentActions().uploadFile(presentationId, kind, file),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appAttachmentKeys.list(presentationId) });
      },
    });
  }

  function useCreateLink(presentationId: string) {
    return useMutation({
      mutationFn: (input: AttachmentCreateLink) => attachmentActions().createLink(presentationId, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appAttachmentKeys.list(presentationId) });
      },
    });
  }

  return { useList, useUploadFile, useCreateLink };
}
