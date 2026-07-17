"use client";

import { AppPresentationsOutlineList } from "@/components/app/presentations/outline/app-presentations-outline-list";
import { AppPresentationsOutlineParameters } from "@/components/app/presentations/outline/parameters/app-presentations-outline-parameters";
import { useOutlineActions, useOutlineParams } from "@/providers/app/app-presentations-outline-provider";

export function AppPresentationsOutlineBody() {
  const params = useOutlineParams();
  const { onParamChange } = useOutlineActions();

  return (
    <div className="app-presentations-outline-body mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-24 pt-6">
      <AppPresentationsOutlineList />
      <AppPresentationsOutlineParameters
        theme={params.theme}
        onThemeChange={(value) => onParamChange("theme", value)}
        amount={params.amount}
        onAmountChange={(value) => onParamChange("amount", value)}
      />
    </div>
  );
}
