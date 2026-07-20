"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Blend,
  Box,
  Building2,
  CalendarRange,
  ChevronDown,
  CircleDot,
  Database,
  Filter,
  GitFork,
  GripVertical,
  History,
  Grid3x3,
  LayoutPanelTop,
  ListTree,
  Network,
  RefreshCw,
  Rows3,
  Share2,
  Sparkles,
  Trash2,
  Triangle,
  Users,
  Waypoints,
  Workflow,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OutlineRepresentation, OutlineType } from "@/lib/drizzle/schema/outline";
import { cn } from "@/lib/utils";
import {
  useAppPresentationsOutline,
  useOutlineActions,
  useOutlineCanDelete,
  useOutlineCard,
  useOutlineRegeneratingIds,
} from "@/providers/app/app-presentations-outline-provider";

export const TYPE_CONFIG = {
  [OutlineType.cover]: {
    key: "cover" as const,
    border: "border-l-amber-500",
    badge: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  [OutlineType.content]: {
    key: "content" as const,
    border: "border-l-blue-500",
    badge: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  [OutlineType.closing]: {
    key: "closing" as const,
    border: "border-l-emerald-500",
    badge: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

const REPRESENTATION_KEY = Object.fromEntries(
  Object.entries(OutlineRepresentation).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof OutlineRepresentation>;

type Family = "general" | "flow" | "structure" | "data" | "technical";

export const FAMILY_STYLE: Record<Family, { ring: string; bg: string; icon: string }> = {
  general:   { ring: "ring-violet-500/20", bg: "bg-violet-500/10", icon: "text-violet-600 dark:text-violet-400" },
  flow:      { ring: "ring-blue-500/20",   bg: "bg-blue-500/10",   icon: "text-blue-600 dark:text-blue-400" },
  structure: { ring: "ring-purple-500/20", bg: "bg-purple-500/10", icon: "text-purple-600 dark:text-purple-400" },
  data:      { ring: "ring-amber-500/20",  bg: "bg-amber-500/10",  icon: "text-amber-600 dark:text-amber-400" },
  technical: { ring: "ring-slate-500/20",  bg: "bg-slate-500/10",  icon: "text-slate-600 dark:text-slate-400" },
};

// Ícone + família por representação — dá identidade visual pro que antes era
// só texto num dropdown (ver mockup aprovado, conversa 2026-07-18).
export const REPRESENTATION_META: Record<number, { family: Family; icon: React.ElementType }> = {
  [OutlineRepresentation.auto]:         { family: "general", icon: Sparkles },
  [OutlineRepresentation.infographic]:  { family: "general", icon: LayoutPanelTop },
  [OutlineRepresentation.flowchart]:    { family: "flow", icon: Workflow },
  [OutlineRepresentation.sequence]:     { family: "flow", icon: Waypoints },
  [OutlineRepresentation.swimlane]:     { family: "flow", icon: Rows3 },
  [OutlineRepresentation.state]:        { family: "flow", icon: CircleDot },
  [OutlineRepresentation.dataflow]:     { family: "flow", icon: GitFork },
  [OutlineRepresentation.mindmap]:      { family: "structure", icon: Share2 },
  [OutlineRepresentation.tree]:         { family: "structure", icon: ListTree },
  [OutlineRepresentation.orgchart]:     { family: "structure", icon: Users },
  [OutlineRepresentation.network]:      { family: "structure", icon: Network },
  [OutlineRepresentation.architecture]: { family: "structure", icon: Building2 },
  [OutlineRepresentation.gantt]:        { family: "data", icon: CalendarRange },
  [OutlineRepresentation.timeline]:     { family: "data", icon: History },
  [OutlineRepresentation.matrix]:       { family: "data", icon: Grid3x3 },
  [OutlineRepresentation.funnel]:       { family: "data", icon: Filter },
  [OutlineRepresentation.pyramid]:      { family: "data", icon: Triangle },
  [OutlineRepresentation.venn]:         { family: "data", icon: Blend },
  [OutlineRepresentation.class]:        { family: "technical", icon: Box },
  [OutlineRepresentation.er]:           { family: "technical", icon: Database },
  [OutlineRepresentation.fishbone]:     { family: "technical", icon: GitFork },
};

const ALL_GROUPS = [
  {
    key: "general" as const,
    items: [OutlineRepresentation.auto, OutlineRepresentation.infographic],
  },
  {
    key: "flow" as const,
    items: [
      OutlineRepresentation.flowchart,
      OutlineRepresentation.sequence,
      OutlineRepresentation.swimlane,
      OutlineRepresentation.state,
      OutlineRepresentation.dataflow,
    ],
  },
  {
    key: "structure" as const,
    items: [
      OutlineRepresentation.mindmap,
      OutlineRepresentation.tree,
      OutlineRepresentation.orgchart,
      OutlineRepresentation.network,
      OutlineRepresentation.architecture,
    ],
  },
  {
    key: "data" as const,
    items: [
      OutlineRepresentation.gantt,
      OutlineRepresentation.timeline,
      OutlineRepresentation.matrix,
      OutlineRepresentation.funnel,
      OutlineRepresentation.pyramid,
      OutlineRepresentation.venn,
    ],
  },
  {
    key: "technical" as const,
    items: [
      OutlineRepresentation.class,
      OutlineRepresentation.er,
      OutlineRepresentation.fishbone,
    ],
  },
];

export interface AppPresentationsOutlineCardItem {
  id: string;
  order: number;
  type: number;
  title: string;
  description: string;
  concepts: string[];
  representation: number;
}

interface AppPresentationsOutlineCardProps {
  id: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

// Lê os próprios dados via useOutlineCard(id) em vez de receber o item
// inteiro como prop — digitar num campo deste card não recria a prop de
// nenhum outro (a store preserva a referência dos itens não afetados), então
// os outros cards não re-renderizam. Ver store/app-outline-store.ts.
// isExpanded/onToggleExpand vêm de fora (List) porque o storyboard precisa
// expandir um card específico a partir de outro componente.
export function AppPresentationsOutlineCard({ id, isExpanded, onToggleExpand, cardRef }: AppPresentationsOutlineCardProps) {
  const t = useTranslations("app.outline.card");
  const item = useOutlineCard(id);
  const { onTitleChange, onDescriptionChange, onRepresentationChange, onDelete } = useOutlineActions();
  const { onRegenerateCard } = useAppPresentationsOutline();
  const isRegenerating = useOutlineRegeneratingIds().has(id);
  const canDelete = useOutlineCanDelete();
  // Arrastar é sempre livre agora — type (capa/conteúdo/encerramento) é
  // derivado da posição, não trava mais item nenhum (ver deriveTypes em
  // app-outline-store.ts). useSortable sem `disabled`.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  if (!item) return null;

  const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG];
  const meta = REPRESENTATION_META[item.representation];
  const style = FAMILY_STYLE[meta.family];
  const Icon = meta.icon;
  // Capa/encerramento continuam restritos a representações "gerais" — isso
  // é sobre o TIPO de conteúdo fazer sentido (um título não é fluxograma),
  // não mais sobre posição travada.
  const isEdgeType = item.type === OutlineType.cover || item.type === OutlineType.closing;
  const visibleGroups = isEdgeType
    ? ALL_GROUPS.filter((g) => g.key === "general")
    : ALL_GROUPS;

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        cardRef?.(el);
      }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "app-outline-card relative flex rounded-lg border border-l-4 bg-card shadow-sm",
        config.border,
        isDragging && "z-10 opacity-70 shadow-lg",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={t("dragHandle")}
        className="app-outline-card-drag-handle flex w-8 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex flex-1 flex-col p-3 pl-0">
        {/* Resumo — sempre visível, clicável (progressive disclosure, ver
            mockup aprovado). Card nasce fechado; edição fica atrás do clique. */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="app-outline-card-summary flex w-full items-center gap-3 p-2 text-left"
        >
          <span className="app-outline-card-order font-mono text-xs tabular-nums text-muted-foreground/50">
            {String(item.order + 1).padStart(2, "0")}
          </span>

          <div className={cn("app-outline-card-representation-icon flex size-9 shrink-0 items-center justify-center rounded-full ring-1", style.bg, style.ring)}>
            <Icon className={cn("size-4", style.icon)} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="app-outline-card-summary-title truncate text-sm font-medium">
              {item.title || t("fields.title")}
            </span>
            <span className="flex items-center gap-1.5">
              <Badge
                className={cn(
                  "app-outline-card-type rounded-full border px-2 py-0 text-[0.65rem] font-medium",
                  config.badge,
                )}
              >
                {t(`types.${config.key}`)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {t(`representations.${REPRESENTATION_KEY[item.representation]}`)}
              </span>
            </span>
          </div>

          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
        </button>

        {isExpanded && (
          <div className="app-outline-card-body flex flex-col gap-3 border-t px-2 pb-2 pt-3">
            <div className="app-outline-card-header-actions flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerateCard(item.id)}
                disabled={isRegenerating}
                className="app-outline-card-regenerate h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={cn("size-3", isRegenerating && "animate-spin")} />
                {isRegenerating ? t("regenerating") : t("regenerate")}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(item.id)}
                disabled={!canDelete}
                aria-label={t("delete")}
                className="app-outline-card-delete text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            {/* Title */}
            <div className="app-outline-card-field flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("fields.title")}
              </label>
              <Input
                value={item.title}
                onChange={(e) => onTitleChange(item.id, e.target.value)}
                className="app-outline-card-title h-9 border-transparent bg-muted/40 transition-colors hover:border-input focus-visible:border-ring focus-visible:bg-background"
              />
            </div>

            {/* Description */}
            <div className="app-outline-card-field flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("fields.description")}
              </label>
              <Textarea
                value={item.description}
                onChange={(e) => onDescriptionChange(item.id, e.target.value)}
                rows={2}
                className="app-outline-card-description resize-none border-transparent bg-muted/40 transition-colors hover:border-input focus-visible:border-ring focus-visible:bg-background"
              />
            </div>

            {/* Representation */}
            <div className="app-outline-card-field flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("fields.representation")}
              </label>
              <Select
                value={String(item.representation)}
                onValueChange={(v) => onRepresentationChange(item.id, Number(v))}
              >
                <SelectTrigger
                  size="sm"
                  className="app-outline-card-representation w-full border-transparent bg-muted/40 hover:border-input"
                >
                  <SelectValue>
                    {(value: string | null) =>
                      value !== null
                        ? t(`representations.${REPRESENTATION_KEY[Number(value)]}`)
                        : t("representations.auto")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {visibleGroups.map((group) => (
                    <SelectGroup key={group.key}>
                      <SelectLabel>{t(`groups.${group.key}`)}</SelectLabel>
                      {group.items.map((repValue) => (
                        <SelectItem key={repValue} value={String(repValue)}>
                          {t(`representations.${REPRESENTATION_KEY[repValue]}`)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              {/* Legenda, não campo editável — layout descreve a organização
                  visual DESSA representação específica; edição livre criaria
                  descrição desencontrada da representação escolhida (ver
                  onRepresentationChange na store, que limpa isso ao trocar).
                  Só Regenerar produz um par coerente entre os dois. */}
              {item.layout && (
                <p className="app-outline-card-layout text-xs italic text-muted-foreground/70">
                  {item.layout}
                </p>
              )}
            </div>

            {/* Concepts */}
            {item.concepts.length > 0 && (
              <div className="app-outline-card-field flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("fields.concepts")}
                </span>
                <div className="app-outline-card-concepts flex flex-wrap gap-1.5">
                  {item.concepts.map((concept) => (
                    <Badge
                      key={concept}
                      variant="secondary"
                      className="rounded-full text-xs"
                    >
                      {concept}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
