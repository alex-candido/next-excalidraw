"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthFormOAuth({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("auth.oauth");

  return (
    <div
      className={cn("auth-form-oauth", className)}
      {...props}
    >
      <Button variant="outline" className="auth-form-oauth-google w-full">
        {t("google")}
      </Button>
    </div>
  );
}
