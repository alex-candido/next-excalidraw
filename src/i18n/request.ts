import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "./dictionaries";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(requested ?? "") ? requested! : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./dictionaries/${locale}.json`)).default,
  };
});
