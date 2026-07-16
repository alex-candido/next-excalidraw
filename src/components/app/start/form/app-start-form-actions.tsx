"use client";

import { ImageIcon, Link2, Loader2, Paperclip, Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStart } from "@/providers/app/app-start-provider";

// Anexo é material de referência pra ajudar a IA a gerar a apresentation (não é
// exportação/output) — sem suporte no backend ainda, fica em estado local no
// provider. Ver pm.md Backlog.
export function AppStartFormActions() {
  const t = useTranslations("app.start.form");
  const { isSubmitting, errors, onSubmit, onAddAttachment } = useAppStart();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkValue, setLinkValue] = useState("");
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  const onLinkConfirm = () => {
    if (!linkValue.trim()) return;
    onAddAttachment("link", linkValue.trim());
    setLinkValue("");
    setIsLinkOpen(false);
  };

  return (
    <div className="app-start-form-actions flex items-center gap-1">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAddAttachment("image", file);
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAddAttachment("file", file);
          e.target.value = "";
        }}
      />
      <TooltipProvider delay={300}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("attachments.image")}
                onClick={() => imageInputRef.current?.click()}
              />
            }
          >
            <ImageIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{t("attachments.image")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("attachments.file")}
                onClick={() => fileInputRef.current?.click()}
              />
            }
          >
            <Paperclip className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{t("attachments.file")}</TooltipContent>
        </Tooltip>
        <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={<Button variant="ghost" size="icon" aria-label={t("attachments.link")} />}
                />
              }
            >
              <Link2 className="size-4" />
            </TooltipTrigger>
            <TooltipContent>{t("attachments.link")}</TooltipContent>
          </Tooltip>
          <PopoverContent align="start" className="app-start-form-link-popover w-64">
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onLinkConfirm()}
                placeholder={t("attachments.linkPlaceholder")}
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={onLinkConfirm} disabled={!linkValue.trim()}>
                {t("attachments.linkConfirm")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
      <FieldError className="app-start-form-submit-error text-xs" errors={[errors.root]} />
      {/* ref: animata.design/docs/button/ai-button — sem o burst de partículas (tsparticles)
          da referência, só o anel/preenchimento em gradiente + sparkle animado */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="app-start-form-submit group/ai relative cursor-pointer rounded-full bg-linear-to-r from-blue-300/30 via-blue-500/30 via-40% to-purple-500/30 p-1 transition-transform hover:scale-105 active:scale-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="relative flex items-center gap-1.5 rounded-full bg-linear-to-r from-blue-300 via-blue-500 via-40% to-purple-500 px-4 py-1.5 text-sm font-semibold text-white">
          {isSubmitting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkle className="size-3.5 animate-sparkle fill-white" />
          )}
          {t("send")}
        </span>
      </button>
    </div>
  );
}
