"use client";

import {
  Bug,
  Code2,
  Download,
  FileImage,
  FileJson,
  History,
  Image as ImageIcon,
  Link as LinkIcon,
  MoreVertical,
  Pencil,
  Play,
  Save,
  Settings2,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { AppPresentationTrashModal } from "@/components/app/presentations/app-presentation-trash-modal";
import { useAppStudioDebugExport } from "@/hooks/app/studio/use-app-studio-debug-export";
import {
  useAppPresentationsStudio,
  useStudioActions,
  useStudioIsSaving,
  type StudioPanelKey,
} from "@/providers/app/app-presentations-studio-provider";

type StudioActionKey = "share" | "rename" | "favorite" | "copyLink" | "slideConfig" | "source" | "versionHistory";
type StudioExportActionKey = "exportPng" | "exportSvg" | "exportJson";

const PRESENTATION_ACTIONS: StudioActionKey[] = ["share", "rename", "favorite", "copyLink"];
const PANEL_ACTIONS: Array<"slideConfig" | "source" | "versionHistory"> = [
  "slideConfig",
  "source",
  "versionHistory",
];

const EXPORT_ACTIONS: StudioExportActionKey[] = ["exportPng", "exportSvg", "exportJson"];

const ACTION_ICON: Record<StudioActionKey, React.ElementType> = {
  share: Share2,
  rename: Pencil,
  favorite: Star,
  copyLink: LinkIcon,
  slideConfig: Settings2,
  source: Code2,
  versionHistory: History,
};

const PANEL_KEY_BY_ACTION: Record<"slideConfig" | "source" | "versionHistory", StudioPanelKey> = {
  slideConfig: "settings",
  source: "source",
  versionHistory: "history",
};

const EXPORT_ACTION_ICON: Record<StudioExportActionKey, React.ElementType> = {
  exportPng: ImageIcon,
  exportSvg: FileImage,
  exportJson: FileJson,
};

export function AppPresentationsStudioActions() {
  const t = useTranslations("app.studio.header");
  const { title, createdAtLabel, createdBy, isFavorited, onSave } = useAppPresentationsStudio();
  const isSaving = useStudioIsSaving();
  const { onOpenPanel } = useStudioActions();
  const { id } = useParams<{ id: string }>();
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const { exportAll: onDebugExport, isExporting: isDebugExporting } = useAppStudioDebugExport(id);

  return (
    <div className="app-presentations-studio-actions flex items-center gap-1.5">
      <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving} className="gap-1.5">
        <Save className="size-3.5" />
        {isSaving ? t("saving") : t("save")}
      </Button>

      {/* Só em dev — ferramenta de debug (screenshot real do canvas salvo
          local no projeto), não é feature de produto. Ver
          use-app-studio-debug-export.ts. */}
      {process.env.NODE_ENV === "development" && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDebugExport}
          disabled={isDebugExporting}
          className="app-presentations-studio-actions-debug-export gap-1.5"
        >
          <Bug className="size-3.5" />
          {isDebugExporting ? "Exportando…" : "Exportar (debug)"}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <Download className="size-3.5" />
          {t("export")}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {EXPORT_ACTIONS.map((key) => {
            const Icon = EXPORT_ACTION_ICON[key];
            return (
              <DropdownMenuItem key={key} className={`app-presentations-studio-actions-${key} gap-2`}>
                <Icon className="size-4" />
                {t(key)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="sm"
        render={<Link href={`/app/presentations/${id}/present`} />}
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

        <DropdownMenuContent className="app-presentations-studio-actions-content w-56" align="end">
          <div className="app-presentations-studio-actions-header flex flex-col gap-0.5 px-2 py-1.5">
            <span className="app-presentations-studio-actions-header-title truncate text-sm font-medium text-foreground">
              {title}
            </span>
            <span className="app-presentations-studio-actions-header-meta text-xs text-muted-foreground">
              {t("meta.created", { date: createdAtLabel, author: createdBy })}
            </span>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {PRESENTATION_ACTIONS.map((key) => {
              const Icon = ACTION_ICON[key];
              const isFavoriteKey = key === "favorite";
              return (
                <DropdownMenuItem key={key} className={`app-presentations-studio-actions-${key} gap-2`}>
                  <Icon
                    className={cn(
                      "size-4",
                      isFavoriteKey && isFavorited && "fill-yellow-500 text-yellow-500",
                    )}
                  />
                  {isFavoriteKey ? t(isFavorited ? "unfavorite" : "favorite") : t(key)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {PANEL_ACTIONS.map((key) => {
              const Icon = ACTION_ICON[key];
              const panelKey = PANEL_KEY_BY_ACTION[key];
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onOpenPanel(panelKey)}
                  className={`app-presentations-studio-actions-${key} gap-2`}
                >
                  <Icon className="size-4" />
                  {t(key)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="app-presentations-studio-actions-trash gap-2 text-destructive focus:text-destructive"
            onClick={() => setTrashModalOpen(true)}
          >
            <Trash2 className="size-4" />
            {t("trash")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AppPresentationTrashModal
        open={trashModalOpen}
        onOpenChange={setTrashModalOpen}
        title={title}
      />
    </div>
  );
}
