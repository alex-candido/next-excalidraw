import { PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Muted } from "@/components/ui/typography";

// Só o Excalidraw existe hoje, mas o seletor já comunica que a engine é uma
// escolha (não um valor fixo) — abre espaço pra outras engines mais pra frente
// sem precisar reestruturar o componente. Ver decisão em pm.md.
export async function AppStartFormEngine() {
  const t = await getTranslations("app.start.form.engine");

  return (
    <div className="app-start-form-engine flex items-center gap-2">
      <Muted className="hidden text-xs sm:block">{t("label")}</Muted>
      <Select defaultValue="excalidraw">
        <SelectTrigger size="sm" className="app-start-form-engine-select h-7 gap-1.5 rounded-full text-xs">
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
