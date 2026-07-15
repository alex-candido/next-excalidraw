import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { AppStartFormActions } from "@/components/app/start/form/app-start-form-actions";
import { AppStartFormControls } from "@/components/app/start/form/app-start-form-controls";
import { AppStartFormEngine } from "@/components/app/start/form/app-start-form-engine";
import { AppStartFormInput } from "@/components/app/start/form/app-start-form-input";
import { AppStartFormOptions } from "@/components/app/start/form/app-start-form-options";

export async function AppStartForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.start.form");

  return (
    <LayoutSection className="first:pt-6 md:pb-16 md:first:pt-8">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-start-form w-full max-w-4xl flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden",
            className,
          )}
          {...props}
        >
          <div className="app-start-form-engine-bar flex items-center justify-between px-4 pt-3">
            <AppStartFormEngine />
            <AppStartFormOptions />
          </div>
          <div className="app-start-form-body flex flex-col p-3">
            <AppStartFormInput />
            <div className="app-start-form-body-footer mt-2 flex items-center justify-between px-1">
              <Muted className="app-start-form-hint text-xs">
                {t("hint")}
              </Muted>
              <AppStartFormActions />
            </div>
          </div>
          <div className="app-start-form-controls-bar border-t px-3 py-2">
            <AppStartFormControls />
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
