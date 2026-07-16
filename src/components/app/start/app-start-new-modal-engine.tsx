"use client";

import { PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Muted } from "@/components/ui/typography";

export function AppStartNewModalEngine() {
  const t = useTranslations("app.new.engine");

  return (
    <div className="app-start-new-modal-engine flex items-center gap-2">
      <Muted className="text-xs">{t("label")}</Muted>
      <Select defaultValue="excalidraw">
        <SelectTrigger size="sm" className="app-start-new-modal-engine-select h-7 gap-1.5 rounded-full text-xs">
          <PenLine className="size-3" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="excalidraw">{t("name")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
