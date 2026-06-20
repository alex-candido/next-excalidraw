"use client";

import { useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function AuthFormDivider({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.oauth");

  return (
    <div
      className={cn("auth-form-divider flex items-center gap-3", className)}
      {...props}
    >
      <Separator className="flex-1" />
      <Muted className="text-xs">{t("divider")}</Muted>
      <Separator className="flex-1" />
    </div>
  );
}
