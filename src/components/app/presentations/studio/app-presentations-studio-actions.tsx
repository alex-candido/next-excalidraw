"use client";

import { Code2, History, MoreVertical, Play, Save, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAppPresentationsStudio } from "@/providers/app/app-presentations-studio-provider";

export function AppPresentationsStudioActions() {
  const t = useTranslations("app.studio.header");
  const { onSave, isSaving } = useAppPresentationsStudio();

  return (
    <div className="app-presentations-studio-actions flex items-center gap-1.5">

      <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving} className="gap-1.5">
        <Save className="size-3.5" />
        {isSaving ? t("saving") : t("save")}
      </Button>

      <Button
        size="sm"
        render={<Link href="/app/presentations/mock/present" />}
        nativeButton={false}
        className="gap-1.5"
      >
        <Play className="size-3.5" />
        {t("present")}
      </Button>

            <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t("moreActions")}
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Settings2 className="size-3.5" />
            {t("slideConfig")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Code2 className="size-3.5" />
            {t("source")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <History className="size-3.5" />
            {t("versionHistory")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t("export")}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>{t("exportPng")}</DropdownMenuItem>
              <DropdownMenuItem>{t("exportSvg")}</DropdownMenuItem>
              <DropdownMenuItem>{t("exportJson")}</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
