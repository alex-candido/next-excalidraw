"use client";

import { Square } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function AppPresentationsPresentExit() {
  const t = useTranslations("app.present.actions");
  const { id } = useParams<{ id: string }>();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      render={<Link href={`/app/presentations/${id}/studio`} />}
      nativeButton={false}
      aria-label={t("exit")}
      className="app-presentations-present-exit rounded-full"
    >
      <Square className="size-3.5" />
    </Button>
  );
}
