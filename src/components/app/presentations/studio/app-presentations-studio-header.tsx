"use client";

import { useState } from "react";
import {
  Bell,
  Bug,
  Code2,
  CreditCard,
  Download,
  GalleryVerticalEnd,
  History,
  Home,
  LayoutTemplate,
  Menu,
  MessageSquareText,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Save,
  Settings2,
  Share2,
  Star,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { AppPresentationTrashModal } from "@/components/app/presentations/app-presentation-trash-modal";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/ui/user-menu";
import { useAppStudioDebugExport } from "@/hooks/app/studio/use-app-studio-debug-export";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutHeader } from "@/components/layouts/layout-header";
import { LayoutNavActions } from "@/components/layouts/layout-nav-actions";
import { LayoutNavBrand } from "@/components/layouts/layout-nav-brand";
import { LayoutNavEnd } from "@/components/layouts/layout-nav-end";
import { LayoutNavUserMenu } from "@/components/layouts/layout-nav-user-menu";
import {
  useAppPresentationsStudio,
  useStudioActions,
  useStudioIsSaving,
  type StudioPanelKey,
} from "@/providers/app/app-presentations-studio-provider";

const PANEL_ACTIONS: Array<{ key: StudioPanelKey; icon: React.ElementType }> = [
  { key: "settings",  icon: Settings2 },
  { key: "templates", icon: LayoutTemplate },
  { key: "assistant", icon: MessageSquareText },
  { key: "source",    icon: Code2 },
  { key: "history",   icon: History },
];

function AppPresentationsStudioTitle() {
  const t = useTranslations("app.studio.header");
  const { title, onRenameTitle } = useAppPresentationsStudio();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onRenameTitle(trimmed);
    else setDraft(title);
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        aria-label={t("rename")}
        className="app-presentations-studio-header-title-input h-7 w-56 text-sm"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(title); setEditing(true); }}
      aria-label={t("rename")}
      className="app-presentations-studio-header-title flex min-w-0 items-center gap-1.5"
    >
      <span className="truncate text-sm font-medium">{title}</span>
      <Pencil className="size-3 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function AppPresentationsStudioHeader() {
  const t = useTranslations("app.studio.header");
  const tUserMenu = useTranslations("common.userMenu");
  const { title, isFavorited, onSave } = useAppPresentationsStudio();
  const isSaving = useStudioIsSaving();
  const { onOpenPanel } = useStudioActions();
  const { id } = useParams<{ id: string }>();
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const { exportAll: onDebugExport, isExporting: isDebugExporting } = useAppStudioDebugExport(id);

  return (
    <LayoutHeader>
      <LayoutContainer className="md:max-w-full!">
        <LayoutNavBrand className="app-presentations-studio-header-brand min-w-0 items-center! gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={t("navMenu")}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "app-presentations-studio-header-nav-menu shrink-0")}
            >
              <Menu className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="app-presentations-studio-header-nav-menu-content w-56">
              <DropdownMenuItem render={<Link href="/app/start" />} className="gap-2">
                <Home className="size-4" />
                {t("navMenuStart")}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/app/presentations" />} className="gap-2">
                <GalleryVerticalEnd className="size-4" />
                {t("navMenuPresentations")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/app/start" />} className="gap-2">
                <Plus className="size-4" />
                {t("navMenuNew")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex min-w-0 flex-col items-start gap-0.5">
            <AppPresentationsStudioTitle />
            <Badge variant="secondary" className="app-presentations-studio-header-engine h-4.5 w-fit gap-1 rounded-full px-1.5 text-[10px]">
              {t("engine")}
            </Badge>
          </div>
        </LayoutNavBrand>

        <LayoutNavEnd>
          <LayoutNavActions className="app-presentations-studio-header-actions">
            <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving} className="gap-1.5">
              <Save className="size-3.5" />
              {isSaving ? t("saving") : t("save")}
            </Button>

            {/* Só em dev — ferramenta de debug (screenshot real do canvas
                salvo local no projeto), não é feature de produto. Ver
                use-app-studio-debug-export.ts. */}
            {process.env.NODE_ENV === "development" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDebugExport}
                disabled={isDebugExporting}
                className="app-presentations-studio-header-debug-export gap-1.5"
              >
                <Bug className="size-3.5" />
                {isDebugExporting ? "Exportando…" : "Exportar (debug)"}
              </Button>
            )}

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
                className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "app-presentations-studio-header-more")}
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="app-presentations-studio-header-more-content w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="app-presentations-studio-header-share gap-2">
                    <Share2 className="size-4" />
                    {t("share")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="app-presentations-studio-header-favorite gap-2">
                    <Star className={cn("size-4", isFavorited && "fill-yellow-500 text-yellow-500")} />
                    {isFavorited ? t("unfavorite") : t("favorite")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem className="app-presentations-studio-header-export-png gap-2">
                    <Download className="size-4" />
                    {t("exportPng")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="app-presentations-studio-header-export-svg gap-2">
                    <Download className="size-4" />
                    {t("exportSvg")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="app-presentations-studio-header-export-json gap-2">
                    <Download className="size-4" />
                    {t("exportJson")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Único ponto de acesso ao painel (settings/templates/
                    assistente/source/histórico) — sem rail permanente
                    (decisão 2026-07-19: uma segunda barra lateral fixa
                    espremia o canvas sem ganho real sobre este menu). */}
                <DropdownMenuGroup>
                  {PANEL_ACTIONS.map(({ key, icon: Icon }) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => onOpenPanel(key)}
                      className={`app-presentations-studio-header-panel-${key} gap-2`}
                    >
                      <Icon className="size-4" />
                      {t(`panelActions.${key}`)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="app-presentations-studio-header-trash gap-2 text-destructive focus:text-destructive"
                  onClick={() => setTrashModalOpen(true)}
                >
                  <Trash2 className="size-4" />
                  {t("trash")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="app-presentations-studio-header-divider h-6 w-px bg-border" />

            <ThemeToggle />
            <LanguageSwitcher />

            <LayoutNavUserMenu>
              <UserMenu
                upgradeHref="/app/settings/billing"
                actions={[
                  { key: "billing", label: tUserMenu("billing"), icon: <CreditCard className="size-4" />, href: "/app/settings/billing" },
                  { key: "profile", label: tUserMenu("profile"), icon: <User className="size-4" />, href: "/app/settings/profile" },
                  { key: "account", label: tUserMenu("account"), icon: <UserCog className="size-4" />, href: "/app/settings/account" },
                  { key: "notifications", label: tUserMenu("notifications"), icon: <Bell className="size-4" />, href: "/app/settings/notifications" },
                ]}
              />
            </LayoutNavUserMenu>
          </LayoutNavActions>
        </LayoutNavEnd>
      </LayoutContainer>

      <AppPresentationTrashModal
        open={trashModalOpen}
        onOpenChange={setTrashModalOpen}
        title={title}
      />
    </LayoutHeader>
  );
}
