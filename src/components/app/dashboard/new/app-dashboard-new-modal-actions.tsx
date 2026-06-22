"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

interface AppDashboardNewModalActionsProps {
  onCancel: () => void;
}

export function AppDashboardNewModalActions({
  onCancel,
}: AppDashboardNewModalActionsProps) {
  const t = useTranslations("app.new.actions");

  return (
    <DialogFooter>
      <DialogClose render={<Button variant="ghost" size="sm" onClick={onCancel} />}>
        {t("cancel")}
      </DialogClose>
      <Button size="sm" className="gap-1.5">
        <ArrowRight className="size-3.5" />
        {t("create")}
      </Button>
    </DialogFooter>
  );
}
