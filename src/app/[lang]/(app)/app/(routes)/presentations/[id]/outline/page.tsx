"use client";

import { AppPresentationsOutlineBody } from "@/components/app/presentations/outline/app-presentations-outline-body";
import { AppPresentationsOutlineBottomBar } from "@/components/app/presentations/outline/app-presentations-outline-bottom-bar";
import { AppPresentationsOutlineGenerating } from "@/components/app/presentations/outline/app-presentations-outline-generating";
import { AppPresentationsOutlineHero } from "@/components/app/presentations/outline/hero/app-presentations-outline-hero";
import { useAppPresentationsOutline } from "@/providers/app/app-presentations-outline-provider";

export default function OutlinePage() {
  const { isLoading, isGeneratingInitial } = useAppPresentationsOutline();

  if (isLoading || isGeneratingInitial) {
    return (
      <div className="app-presentations-outline-page">
        <AppPresentationsOutlineGenerating />
      </div>
    );
  }

  return (
    <div className="app-presentations-outline-page">
      <AppPresentationsOutlineHero />
      <AppPresentationsOutlineBody />
      <AppPresentationsOutlineBottomBar />
    </div>
  );
}
