import Link from "next/link";
import { PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Muted } from "@/components/ui/typography";

export async function LandingFooterBrand() {
  const t = await getTranslations("landing.footer.brand");

  return (
    <div className="landing-footer-brand col-span-2 flex flex-col gap-3 md:col-span-1">
      <Link href="/landing/home" className="flex items-center gap-2 font-semibold text-sm">
        <PenLine className="size-4" />
        <span>Next Excalidraw</span>
      </Link>
      <Muted className="max-w-[200px]">{t("description")}</Muted>
    </div>
  );
}
