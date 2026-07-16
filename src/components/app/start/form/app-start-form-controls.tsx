"use client";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import type { PresentationCreate } from "@/schemas/app/presentation-schema";
import { useAppStart } from "@/providers/app/app-start-provider";

// slideCount só faz sentido pro modo multi (número de slides de uma apresentação) —
// no modo single é uma página só, esse parâmetro não se aplica. Todos os outros
// ficam sempre visíveis, sem esconder atrás de "mais opções".
const ALL_KEYS = [
  "slideCount", "language", "aspectRatio", "amount", "audience", "scenario", "theme",
] as const satisfies readonly (keyof PresentationCreate)[];

type ControlKey = (typeof ALL_KEYS)[number];

export function AppStartFormControls() {
  const t = useTranslations("app.start.form.controls");
  const { type, control } = useAppStart();

  const keys = ALL_KEYS.filter(
    (key) => key !== "slideCount" || type === PresentationType.multi,
  );

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
            onValueChange={(v) => field.onChange(Number(v))}
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
    <div className="app-start-form-controls flex flex-wrap items-center gap-1.5">
      {keys.map(renderControl)}
    </div>
  );
}
