"use client";

import { FileText, ImageIcon, Link2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStart } from "@/providers/app/app-start-provider";

const ATTACHMENT_ICON = {
  image: ImageIcon,
  file: FileText,
  link: Link2,
} as const;

export function AppStartFormAttachments() {
  const { attachments, onRemoveAttachment } = useAppStart();

  if (attachments.length === 0) return null;

  return (
    <div className="app-start-form-attachments flex flex-wrap items-center gap-1.5 px-1 pt-3">
      {attachments.map((attachment) => {
        const Icon = ATTACHMENT_ICON[attachment.type];
        return (
          <Badge
            key={attachment.id}
            variant="secondary"
            className="app-start-form-attachment gap-1.5 rounded-full pr-1"
          >
            <Icon className="size-3" />
            <span className="max-w-32 truncate">{attachment.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-4"
              aria-label="Remove"
              onClick={() => onRemoveAttachment(attachment.id)}
            >
              <X className="size-3" />
            </Button>
          </Badge>
        );
      })}
    </div>
  );
}
