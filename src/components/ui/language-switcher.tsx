"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const locales: { code: string; abbr: string; label: string }[] = [
  { code: "pt-BR", abbr: "PT", label: "Português" },
  { code: "en-US", abbr: "EN", label: "English" },
  { code: "es",    abbr: "ES", label: "Español" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("landing.nav");
  const router = useRouter();
  const pathname = usePathname();

  function handleLocaleChange(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: "ghost", size: "sm", className: "landing-nav-language-trigger px-2" })}
        aria-label={t("language")}
      >
        <Globe className="size-4" />
        <span className="sr-only">{t("language")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="landing-nav-language-menu w-44">
        {locales.map(({ code, abbr, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLocaleChange(code)}
            className={locale === code ? "font-medium" : ""}
          >
            <span className="w-7 shrink-0 text-xs font-mono text-muted-foreground">{abbr}</span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
