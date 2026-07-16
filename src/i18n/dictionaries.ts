import "server-only";

// en-US/es removidos temporariamente — ver routing.ts
const localeSet = new Set(["pt-BR"] as const);

export type Locale = "pt-BR";

export const locales: Locale[] = ["pt-BR"];
export const defaultLocale: Locale = "pt-BR";

export const hasLocale = (locale: string): locale is Locale =>
  localeSet.has(locale as Locale);
