import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { AppDashboardFormActions } from "@/components/app/dashboard/form/app-dashboard-form-actions";
import { AppDashboardFormControls } from "@/components/app/dashboard/form/app-dashboard-form-controls";
import { AppDashboardFormEngine } from "@/components/app/dashboard/form/app-dashboard-form-engine";
import { AppDashboardFormInput } from "@/components/app/dashboard/form/app-dashboard-form-input";
import { AppDashboardFormOptions } from "@/components/app/dashboard/form/app-dashboard-form-options";

export async function AppDashboardForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.dashboard.form");

  return (
    <LayoutSection className="first:pt-10 md:pb-16 md:first:pt-14">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-dashboard-form w-full max-w-4xl flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden",
            className,
          )}
          {...props}
        >
          <div className="app-dashboard-form-engine-bar flex items-center justify-between px-4 pt-3">
            <AppDashboardFormEngine />
            <AppDashboardFormOptions />
          </div>
          <div className="app-dashboard-form-body flex flex-col p-3">
            <AppDashboardFormInput />
            <div className="app-dashboard-form-body-footer mt-2 flex items-center justify-between px-1">
              <Muted className="app-dashboard-form-hint text-xs">
                {t("hint")}
              </Muted>
              <AppDashboardFormActions />
            </div>
          </div>
          <div className="app-dashboard-form-controls-bar border-t px-3 py-2">
            <AppDashboardFormControls />
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
