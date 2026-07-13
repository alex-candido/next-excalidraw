"use client";

import { SelectableCard } from "@/components/ui/selectable-card";
import { cn } from "@/lib/utils";

interface AppPresentationsOutlineThemeCardProps {
  label: string;
  swatch: string[];
  selected: boolean;
  onSelect: () => void;
}

export function AppPresentationsOutlineThemeCard({
  label,
  swatch,
  selected,
  onSelect,
}: AppPresentationsOutlineThemeCardProps) {
  return (
    <SelectableCard
      selected={selected}
      onClick={onSelect}
      className="app-presentations-outline-theme-card w-full"
    >
      <div className="app-presentations-outline-theme-card-swatch flex overflow-hidden rounded-md ring-1 ring-foreground/10">
        {swatch.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="h-6 flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span
        className={cn(
          "app-presentations-outline-theme-card-label text-xs font-medium capitalize",
          selected ? "text-primary" : "text-foreground",
        )}
      >
        {label}
      </span>
    </SelectableCard>
  );
}
