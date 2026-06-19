import "server-only";

const localeSet = new Set(["pt-BR", "en-US", "es"] as const);

export type Locale = "pt-BR" | "en-US" | "es";

export const locales: Locale[] = ["pt-BR", "en-US", "es"];
export const defaultLocale: Locale = "pt-BR";

export const hasLocale = (locale: string): locale is Locale =>
  localeSet.has(locale as Locale);
