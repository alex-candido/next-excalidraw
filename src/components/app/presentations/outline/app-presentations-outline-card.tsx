"use client";

import { RefreshCw } from "lucide-react";
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

const TYPE_CONFIG = {
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
  item: AppPresentationsOutlineCardItem;
  onTitleChange: (id: string, value: string) => void;
  onDescriptionChange: (id: string, value: string) => void;
  onRepresentationChange: (id: string, value: number) => void;
}

export function AppPresentationsOutlineCard({
  item,
  onTitleChange,
  onDescriptionChange,
  onRepresentationChange,
}: AppOutlineCardProps) {
  const t = useTranslations("app.outline.card");
  const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG];
  const isRestricted = item.type === OutlineType.cover || item.type === OutlineType.closing;
  const visibleGroups = isRestricted
    ? ALL_GROUPS.filter((g) => g.key === "general")
    : ALL_GROUPS;

  return (
    <div
      className={cn(
        "app-outline-card relative flex rounded-lg border border-l-4 bg-card shadow-sm",
        config.border,
      )}
    >
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header */}
        <div className="app-outline-card-header flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="app-outline-card-order font-mono text-xs tabular-nums text-muted-foreground/50">
              {String(item.order + 1).padStart(2, "0")}
            </span>
            <Badge
              className={cn(
                "app-outline-card-type rounded-full border px-2.5 py-0.5 text-xs font-medium",
                config.badge,
              )}
            >
              {t(`types.${config.key}`)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="app-outline-card-regenerate h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3" />
            {t("regenerate")}
          </Button>
        </div>

        {/* Body */}
        <div className="app-outline-card-body flex flex-col gap-3">
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
      </div>
    </div>
  );
}
