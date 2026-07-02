"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface SelectableCardProps extends React.ComponentProps<"button"> {
  selected?: boolean;
}

export function SelectableCard({
  selected = false,
  className,
  children,
  ...props
}: SelectableCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-selected={selected}
      className={cn(
        "selectable-card group/selectable-card flex flex-col items-start gap-2 rounded-xl border border-transparent bg-card p-3 text-left ring-1 ring-foreground/10 transition-all hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[selected=true]:border-primary data-[selected=true]:ring-2 data-[selected=true]:ring-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
