"use client";

import { Layers } from "lucide-react";

import { SelectableCard } from "@/components/ui/selectable-card";
import { cn } from "@/lib/utils";

interface AppPresentationsOutlineAmountCardProps {
  label: string;
  range: string;
  selected: boolean;
  onSelect: () => void;
}

export function AppPresentationsOutlineAmountCard({
  label,
  range,
  selected,
  onSelect,
}: AppPresentationsOutlineAmountCardProps) {
  return (
    <SelectableCard
      selected={selected}
      onClick={onSelect}
      className="app-presentations-outline-amount-card w-full"
    >
      <Layers
        className={cn("size-4", selected ? "text-primary" : "text-muted-foreground")}
      />
      <div className="app-presentations-outline-amount-card-labels flex flex-col gap-0.5">
        <span
          className={cn(
            "app-presentations-outline-amount-card-label text-xs font-medium",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {label}
        </span>
        <span className="app-presentations-outline-amount-card-range text-[0.7rem] text-muted-foreground">
          {range}
        </span>
      </div>
    </SelectableCard>
  );
}
