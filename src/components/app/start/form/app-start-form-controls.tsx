"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import type { PresentationCreate } from "@/schemas/app/presentation-schema";
import { useAppStart } from "@/providers/app/app-start-provider";

// slideCount só faz sentido pro modo multi (número de slides de uma apresentação) —
// no modo single é uma página só, esse parâmetro não se aplica.
const ALL_KEYS = [
  "slideCount", "language", "aspectRatio", "amount", "audience", "scenario", "theme",
] as const satisfies readonly (keyof PresentationCreate)[];

type ControlKey = (typeof ALL_KEYS)[number];

// 1ª linha sempre visível — os demais ficam atrás do botão "mais" (2ª linha),
// evitando os 7 juntos numa linha só (poluído). Todos continuam acessíveis,
// só progressivamente revelados, não escondidos de vez atrás de um menu.
const PRIMARY_KEYS = new Set<ControlKey>(["slideCount", "language", "aspectRatio", "amount"]);

// Campos que uma suggestion clicada preenche (ver AppStartProvider.onSelectSuggestion)
// — mudar qualquer um manualmente desfaz o vínculo. `language` fica de fora:
// a suggestion não define idioma, é sempre o do app atual.
const SUGGESTION_FIELDS = new Set<ControlKey>(["slideCount", "aspectRatio", "amount", "audience", "scenario", "theme"]);

export function AppStartFormControls() {
  const t = useTranslations("app.start.form.controls");
  const { type, control, onSuggestionFieldEdit } = useAppStart();
  const [expanded, setExpanded] = useState(false);

  const keys = ALL_KEYS.filter(
    (key) => key !== "slideCount" || type === PresentationType.multi,
  );
  const primaryKeys = keys.filter((key) => PRIMARY_KEYS.has(key));
  const secondaryKeys = keys.filter((key) => !PRIMARY_KEYS.has(key));

  const renderControl = (key: ControlKey) => {
    const items = t.raw(`${key}.items`) as string[];
    const label = t(`${key}.label`);
    // slideCount não é enum (não tem tabela tipo PresentationAmount/Theme/...) — o
    // item da lista É o valor real (ex: "8" slides), diferente dos outros controles
    // onde o valor enviado é o índice do item na lista (bate com o enum do schema).
    const isSlideCount = key === "slideCount";

    return (
      <Controller
        key={key}
        control={control}
        name={key}
        render={({ field }) => (
          <Select
            value={String(field.value)}
            onValueChange={(v) => {
              field.onChange(Number(v));
              if (SUGGESTION_FIELDS.has(key)) onSuggestionFieldEdit();
            }}
          >
            <SelectTrigger size="sm" className="shrink-0 h-7 text-xs gap-1">
              <span className="text-muted-foreground shrink-0">{label}:</span>
              <SelectValue placeholder={items[0]}>
                {(value: string | null) => {
                  if (value === null) return items[0];
                  return isSlideCount ? value : items[Number(value)];
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {items.map((item, index) => (
                <SelectItem key={index} value={isSlideCount ? item : String(index)}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    );
  };

  return (
    <div className="app-start-form-controls flex flex-col gap-1.5">
      <div className="app-start-form-controls-row flex flex-wrap items-center gap-1.5">
        {primaryKeys.map(renderControl)}
        {secondaryKeys.length > 0 && (
          <TooltipProvider delay={300}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="app-start-form-controls-toggle shrink-0 text-muted-foreground"
                    aria-label={expanded ? t("less") : t("more")}
                    onClick={() => setExpanded((v) => !v)}
                  />
                }
              >
                {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </TooltipTrigger>
              <TooltipContent>{expanded ? t("less") : t("more")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {expanded && secondaryKeys.length > 0 && (
        <div className="app-start-form-controls-row flex flex-wrap items-center gap-1.5">
          {secondaryKeys.map(renderControl)}
        </div>
      )}
    </div>
  );
}
