"use client";

import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type { CommunityModalItem } from "@/components/app/app-community-modal";

const SLIDE_COUNT = 5;

interface AppCommunityModalDuplicateViewProps {
  item: CommunityModalItem;
  onAuthorClick?: () => void;
  onClose?: () => void;
}

export function AppCommunityModalDuplicateView({
  item,
  onAuthorClick,
  onClose,
}: AppCommunityModalDuplicateViewProps) {
  const t = useTranslations("app.community.modal");
  const tActions = useTranslations("app.new.actions");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const handler = () => setCurrent(api.selectedScrollSnap());
    api.on("select", handler);
    return () => {
      api.off("select", handler);
    };
  }, [api]);

  return (
    <>
      <div className="app-community-modal-duplicate-thumb flex flex-col">
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

      <div className="app-community-modal-duplicate-body flex flex-col gap-3 p-4">
        <div className="app-community-modal-duplicate-info flex flex-col gap-1.5">
          <span className="app-community-modal-duplicate-title text-base font-semibold leading-snug">
            {item.title}
          </span>
          <div className="app-community-modal-duplicate-meta flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="app-community-modal-duplicate-type rounded-full text-xs"
            >
              {item.typeLabel}
            </Badge>
            <button
              type="button"
              className="app-community-modal-duplicate-author text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={onAuthorClick}
            >
              {item.createdBy}
            </button>
            <span className="app-community-modal-duplicate-date text-xs text-muted-foreground">
              · {item.createdAtLabel}
            </span>
          </div>
        </div>

        <DialogFooter className="justify-start!">
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              />
            }
          >
            {tActions("cancel")}
          </DialogClose>
          <Button
            variant="outline"
            size="sm"
            className="app-community-modal-duplicate-view gap-1.5"
          >
            {t("view")}
          </Button>
          <Button
            size="sm"
            className="app-community-modal-duplicate-action gap-1.5"
          >
            <Copy className="size-3.5" />
            {t("duplicate")}
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}
