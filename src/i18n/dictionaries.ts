import "server-only";

const dictionaries = {
  "pt-BR": () => import("./dictionaries/pt-BR.json").then((m) => m.default),
  "en-US": () => import("./dictionaries/en-US.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;

export const locales: Locale[] = ["pt-BR", "en-US"];
export const defaultLocale: Locale = "pt-BR";

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]();
