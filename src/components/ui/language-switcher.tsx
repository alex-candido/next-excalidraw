"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
        render={<Button variant="outline" size="icon" aria-label={t("language")} />}
      >
        <Globe className="size-4" />
        <span className="sr-only">{t("language")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="landing-nav-language-menu w-44">
        <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
          {locales.map(({ code, abbr, label }) => (
            <DropdownMenuRadioItem key={code} value={code}>
              <span className="shrink-0 text-xs font-mono text-muted-foreground">{abbr}</span>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
