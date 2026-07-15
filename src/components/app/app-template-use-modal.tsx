"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
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

interface AppTemplateUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  typeLabel: string;
  slideCount?: number;
  createdBy: string;
}

export function AppTemplateUseModal({
  open,
  onOpenChange,
  title,
  typeLabel,
  slideCount = 1,
  createdBy,
}: AppTemplateUseModalProps) {
  const t = useTranslations("app.start.templates");
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
      <DialogContent className="app-template-use-modal gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("modal.use")}</DialogDescription>
        </DialogHeader>

        <div className="app-template-use-modal-thumb flex flex-col">
          <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
            <CarouselContent className="ml-0">
              {Array.from({ length: slideCount }).map((_, i) => (
                <CarouselItem key={i} className="pl-0">
                  <div className="aspect-video w-full bg-muted" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex items-center justify-between border-b bg-background px-4 py-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {current + 1} / {slideCount}
            </span>
            {slideCount > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: slideCount }).map((_, i) => (
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
            )}
          </div>
        </div>

        <div className="app-template-use-modal-body flex flex-col gap-3 p-4">
          <div className="app-template-use-modal-info flex flex-col gap-1.5">
            <span className="app-template-use-modal-title text-base font-semibold leading-snug">
              {title}
            </span>
            <div className="app-template-use-modal-meta flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="app-template-use-modal-type rounded-full text-xs"
              >
                {typeLabel}
              </Badge>
              {slideCount && slideCount > 0 && (
                <span className="app-template-use-modal-slides text-xs text-muted-foreground">
                  {slideCount} slides
                </span>
              )}
              <span className="app-template-use-modal-author text-xs text-muted-foreground">
                · {createdBy}
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
            <Button size="sm" className="app-template-use-modal-action gap-1.5">
              <ArrowRight className="size-3.5" />
              {t("modal.use")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
