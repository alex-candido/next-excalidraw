"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PresentationType } from "@/lib/drizzle/schema/presentation";

import { AppDashboardNewModalActions } from "@/components/app/dashboard/app-dashboard-new-modal-actions";
import { AppDashboardNewModalEngine } from "@/components/app/dashboard/app-dashboard-new-modal-engine";
import { AppDashboardNewModalFeatures } from "@/components/app/dashboard/app-dashboard-new-modal-features";
import { AppDashboardNewModalType } from "@/components/app/dashboard/app-dashboard-new-modal-type";

type PresentationTypeValue =
  (typeof PresentationType)[keyof typeof PresentationType];

interface AppDashboardNewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppDashboardNewModal({
  open,
  onOpenChange,
}: AppDashboardNewModalProps) {
  const t = useTranslations("app.new");
  const [type, setType] = useState<PresentationTypeValue>(
    PresentationType.multi,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-dashboard-new-modal sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="app-dashboard-new-modal-heading">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="app-dashboard-new-modal-body flex flex-col gap-3">
          <div className="app-dashboard-new-modal-field-title">
            <Input
              placeholder={t("fields.title.placeholder")}
              className="app-dashboard-new-modal-title-input"
            />
          </div>

          <AppDashboardNewModalEngine />
          <AppDashboardNewModalType value={type} onChange={setType} />
          <AppDashboardNewModalFeatures />
        </div>

        <AppDashboardNewModalActions onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
