"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { AppPresentationsPresentCanvas } from "@/components/app/presentations/present/app-presentations-present-canvas";
import { AppPresentationsPresentNav } from "@/components/app/presentations/present/app-presentations-present-nav";
import { useAppPresentationsPresentNavigation } from "@/hooks/app/use-app-presentations-present-navigation";
import { useRouter } from "@/i18n/navigation";
import { useAppPresentationsPresent } from "@/providers/app/app-presentations-present-provider";

export function AppPresentationsPresentView() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { containerRef } = useAppPresentationsPresent();
  const { onPrevious, onNext } = useAppPresentationsPresentNavigation();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "Escape") router.push(`/app/presentations/${id}/studio`);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNext, onPrevious, router, id]);

  return (
    <div
      ref={containerRef}
      className="app-presentations-present-view relative flex h-screen! min-h-0 flex-1 flex-col overflow-hidden bg-background"
    >
      <AppPresentationsPresentCanvas />
      <AppPresentationsPresentNav />
    </div>
  );
}
