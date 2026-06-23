"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SLIDE_COUNT = 5;

interface AppCommunityDuplicateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  typeLabel: string;
  createdAtLabel: string;
  createdBy: string;
}

export function AppCommunityDuplicateModal({
  open,
  onOpenChange,
  title,
  typeLabel,
  createdAtLabel,
  createdBy,
}: AppCommunityDuplicateModalProps) {
  const t = useTranslations("app.dashboard.community");
  const tActions = useTranslations("app.new.actions");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const handler = () => setCurrent(api.selectedScrollSnap());
    api.on("select", handler);
    return () => { api.off("select", handler); };
  }, [api]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-community-duplicate-modal gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("modal.duplicate")}</DialogDescription>
        </DialogHeader>

        <div className="app-community-duplicate-modal-thumb flex flex-col">
          <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
            <CarouselContent className="ml-0">
              {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                <CarouselItem key={i} className="pl-0">
                  <div className="aspect-video w-full bg-muted" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex items-center justify-between border-b bg-background px-4 py-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {current + 1} / {SLIDE_COUNT}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "rounded-full bg-foreground/20 transition-all hover:bg-foreground/40",
                    i === current ? "size-2 bg-foreground/80" : "size-1.5",
                  )}
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`Ir para slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="app-community-duplicate-modal-body flex flex-col gap-3 p-4">
          <div className="app-community-duplicate-modal-info flex flex-col gap-1.5">
            <span className="app-community-duplicate-modal-title text-base font-semibold leading-snug">
              {title}
            </span>
            <div className="app-community-duplicate-modal-meta flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="app-community-duplicate-modal-type rounded-full text-xs"
              >
                {typeLabel}
              </Badge>
              <span className="app-community-duplicate-modal-author text-xs text-muted-foreground">
                {createdBy}
              </span>
              <span className="app-community-duplicate-modal-date text-xs text-muted-foreground">
                · {createdAtLabel}
              </span>
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                />
              }
            >
              {tActions("cancel")}
            </DialogClose>
            <Button
              variant="outline"
              size="sm"
              className="app-community-duplicate-modal-view gap-1.5"
            >
              {t("modal.view")}
            </Button>
            <Button
              size="sm"
              className="app-community-duplicate-modal-action gap-1.5"
            >
              <Copy className="size-3.5" />
              {t("modal.duplicate")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
