"use client";

import { useTranslations } from "next-intl";

import { FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { useAppStart } from "@/providers/app/app-start-provider";

export function AppStartFormInput() {
  const t = useTranslations("app.start.form");
  const { type, register, errors } = useAppStart();

  const placeholder = t(type === PresentationType.single ? "placeholder.single" : "placeholder.multi");

  return (
    <div className="app-start-form-input-group flex flex-col gap-1">
      <Textarea
        className="app-start-form-input min-h-32 resize-none border-0 shadow-none focus-visible:ring-0 text-base"
        placeholder={placeholder}
        {...register("userPrompt")}
      />
      <FieldError className="px-1" errors={[errors.userPrompt]} />
    </div>
  );
}
