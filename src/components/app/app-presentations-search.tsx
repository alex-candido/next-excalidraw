"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PresentationLanguage,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  {
    id: "1",
    title: "Fluxo de autenticação com login social",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 8,
    createdAtLabel: "há 2 dias",
  },
  {
    id: "2",
    title: "Arquitetura de microsserviços com API gateway",
    type: PresentationType.single,
    language: PresentationLanguage.en,
    slideCount: 1,
    createdAtLabel: "há 5 dias",
  },
  {
    id: "3",
    title: "Roadmap Q3 — Produto e Entregas",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 12,
    createdAtLabel: "há 1 semana",
  },
];

export function AppPresentationsSearch({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const t = useTranslations("app.presentations");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className={cn(
          "app-presentations-search shrink-0 gap-1.5 text-xs",
          className,
        )}
        onClick={(e) => {
          setOpen(true);
          onClick?.(e);
        }}
        {...props}
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">{t("toolbar.searchTrigger")}</span>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("toolbar.search")}
        description={t("toolbar.search")}
        className="sm:max-w-md"
      >
        <CommandInput placeholder={t("toolbar.search")} />
        <CommandList className="p-2">
          <CommandEmpty className="py-10 text-sm text-muted-foreground">
            {t("toolbar.searchEmpty")}
          </CommandEmpty>
          {ITEMS.map((item) => (
            <CommandItem
              key={item.id}
              value={item.title}
              className="app-presentations-search-item gap-3 rounded-lg px-3 py-2.5"
              onSelect={() => {
                router.push(`/app/presentations/${item.id}/studio`);
                setOpen(false);
              }}
            >
              <div className="app-presentations-search-item-thumb aspect-video w-20 shrink-0 overflow-hidden rounded-md border bg-muted" />
              <div className="app-presentations-search-item-info flex min-w-0 flex-col gap-1.5">
                <span className="app-presentations-search-item-title truncate text-sm font-medium leading-snug">
                  {item.title}
                </span>
                <div className="app-presentations-search-item-meta flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="app-presentations-search-item-type rounded-full px-1.5 text-xs"
                  >
                    {t(`types.${TYPE_KEY[item.type]}`)}
                  </Badge>
                  <span className="app-presentations-search-item-date text-xs text-muted-foreground">
                    {item.createdAtLabel}
                  </span>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
