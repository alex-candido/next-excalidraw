"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/use-auth";
import { Link } from "@/i18n/navigation";

export function LandingAppShortcut() {
  const t = useTranslations("landing.nav.cta");
  const { session } = useAuth();

  if (!session.data) return null;

  return (
    <div className="landing-app-shortcut fixed top-20 inset-x-0 z-30 flex justify-center px-4">
      <Link
        href="/app/dashboard"
        className="landing-app-shortcut-pill flex items-center gap-1.5 rounded-full border bg-background/95 px-3.5 py-1.5 text-sm font-medium shadow-lg backdrop-blur-sm transition-colors hover:bg-muted"
      >
        {t("dashboard")}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
