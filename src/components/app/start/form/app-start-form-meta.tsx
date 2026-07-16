"use client";

import { BookOpen, Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";

// Conteúdo do modal é placeholder — copy final fica pra depois. O tutorial de
// verdade (rota /landing/resources/tutorial, ainda não existe) também fica pra
// depois. Só o mapeamento dos dois gatilhos (aviso abre modal, tutorial é link)
// foi pedido agora. Ver pm.md Backlog.
export function AppStartFormMeta() {
  const t = useTranslations("app.start.form.meta");

  return (
    <div className="app-start-form-meta flex items-center gap-1">
      <TooltipProvider delay={300}>
        <Dialog>
          <Tooltip>
            <TooltipTrigger
              render={
                <DialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="app-start-form-notice-trigger text-muted-foreground"
                      aria-label={t("notice.trigger")}
                    />
                  }
                />
              }
            >
              <Info className="size-3" />
            </TooltipTrigger>
            <TooltipContent>{t("notice.trigger")}</TooltipContent>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("notice.title")}</DialogTitle>
              <DialogDescription>{t("notice.description")}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                render={<Link href="/landing/resources/tutorial" />}
                nativeButton={false}
                variant="ghost"
                size="icon-xs"
                className="app-start-form-tutorial-trigger text-muted-foreground"
                aria-label={t("tutorial")}
              />
            }
          >
            <BookOpen className="size-3" />
          </TooltipTrigger>
          <TooltipContent>{t("tutorial")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
