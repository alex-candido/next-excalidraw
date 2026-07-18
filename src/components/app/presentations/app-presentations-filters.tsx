"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { AppStartNewModal } from "@/components/app/start/app-start-new-modal";
import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type AppPresentationsFilter,
  type AppPresentationsVisibilityFilter,
  useAppPresentationsList,
} from "@/providers/app/app-presentations-list-provider";

// Tabs = escopo primário (mutuamente exclusivo, define qual conjunto de
// presentations está sendo mostrado); busca + visibilidade refinam dentro
// desse escopo — não são independentes/"tudo junto" (decidido em conversa
// com o usuário, 2026-07-17). Sem tab "criadas por você" — app ainda não tem
// modelo multi-usuário, não haveria o que diferenciar de "all".
// "favorites" fica de fora do map genérico — tem badge de contagem, mesmo
// tratamento de "trash" logo abaixo.
const FILTER_KEYS: AppPresentationsFilter[] = ["all", "recent", "multi", "single"];

export function AppPresentationsFilters() {
  const t = useTranslations("app.presentations");
  const tNew = useTranslations("app.new");
  const {
    filter,
    onFilterChange,
    search,
    onSearchChange,
    visibilityFilter,
    onVisibilityFilterChange,
    trashCount,
    favoritesCount,
  } = useAppPresentationsList();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <LayoutSection className="pb-6! pt-0!">
        <LayoutContainer className="justify-center">
          <div className="app-presentations-filters flex w-full max-w-4xl flex-col gap-4">
            <Tabs
              value={filter}
              onValueChange={(v) => onFilterChange(v as AppPresentationsFilter)}
            >
              <TabsList className="app-presentations-filters-tabs">
                {FILTER_KEYS.map((key) => (
                  <TabsTrigger key={key} value={key}>
                    {t(`toolbar.filters.${key}`)}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="favorites" className="app-presentations-filters-tab-favorites gap-1.5">
                  {t("toolbar.filters.favorites")}
                  {favoritesCount > 0 && (
                    <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-xs">
                      {favoritesCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="trash" className="app-presentations-filters-tab-trash gap-1.5">
                  {t("toolbar.filters.trash")}
                  {trashCount > 0 && (
                    <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-xs">
                      {trashCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="app-presentations-filters-row flex items-center gap-2">
              <div className="app-presentations-filters-search relative w-full flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t("toolbar.search")}
                  className="h-9 pl-8"
                />
              </div>

              <Select
                value={visibilityFilter}
                onValueChange={(v) => onVisibilityFilterChange(v as AppPresentationsVisibilityFilter)}
              >
                <SelectTrigger className="app-presentations-filters-visibility w-36 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("toolbar.visibility.all")}</SelectItem>
                  <SelectItem value="public">{t("toolbar.visibility.public")}</SelectItem>
                  <SelectItem value="private">{t("toolbar.visibility.private")}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                className="app-presentations-filters-new shrink-0 gap-1.5"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">{tNew("trigger")}</span>
              </Button>
            </div>
          </div>
        </LayoutContainer>
      </LayoutSection>

      <AppStartNewModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
