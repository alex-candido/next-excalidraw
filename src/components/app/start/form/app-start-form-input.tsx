"use client";

import { useTranslations } from "next-intl";

import { FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { useAppStart } from "@/providers/app/app-start-provider";

export function AppStartFormInput() {
  const t = useTranslations("app.start.form");
  const { type, register, errors, onSuggestionFieldEdit } = useAppStart();

  const placeholder = t(type === PresentationType.single ? "placeholder.single" : "placeholder.multi");
  const { onChange, ...promptField } = register("userPrompt");

  return (
    <div className="app-start-form-input-group flex flex-col gap-1">
      <Textarea
        className="app-start-form-input min-h-32 resize-none border-0 shadow-none focus-visible:ring-0 text-base!"
        placeholder={placeholder}
        {...promptField}
        onChange={(e) => {
          onChange(e);
          // Digitação manual desfaz o vínculo com a suggestion clicada (se
          // houver) — ver onSuggestionFieldEdit no provider.
          onSuggestionFieldEdit();
        }}
      />
      <FieldError className="px-1" errors={[errors.userPrompt]} />
    </div>
  );
}
