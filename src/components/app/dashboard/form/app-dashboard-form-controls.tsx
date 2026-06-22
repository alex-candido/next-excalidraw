"use client";

import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONTROL_KEYS = ["slideCount", "language", "aspectRatio"] as const;

export function AppDashboardFormControls() {
  const t = useTranslations("app.dashboard.form.controls");

  return (
    <div className="app-dashboard-form-controls flex flex-wrap items-center gap-1.5">
      {CONTROL_KEYS.map((key) => {
        const items = t.raw(`${key}.items`) as string[];
        const label = t(`${key}.label`);
        return (
          <Select key={key} defaultValue="0">
            <SelectTrigger size="sm" className="shrink-0 h-7 text-xs gap-1">
              <span className="text-muted-foreground shrink-0">{label}:</span>
              <SelectValue placeholder={items[0]}>
                {(value: string | null) => (value !== null ? items[Number(value)] : null) ?? items[0]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {items.map((item, index) => (
                <SelectItem key={index} value={String(index)}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
    </div>
  );
}
