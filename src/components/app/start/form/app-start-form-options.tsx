"use client";

import { GalleryVerticalEnd, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { useAppStart } from "@/providers/app/app-start-provider";

export function AppStartFormOptions() {
  const t = useTranslations("app.start.form.options");
  const { control } = useAppStart();

  return (
    <Controller
      control={control}
      name="type"
      render={({ field }) => (
        <Tabs value={field.value} onValueChange={field.onChange} className="app-start-form-options">
          <TabsList>
            <TabsTrigger value={PresentationType.multi} className="gap-1.5">
              <GalleryVerticalEnd className="size-3.5" />
              <span className="hidden sm:inline">{t("multi")}</span>
            </TabsTrigger>
            <TabsTrigger value={PresentationType.single} className="gap-1.5">
              <PenLine className="size-3.5" />
              <span className="hidden sm:inline">{t("single")}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    />
  );
}
