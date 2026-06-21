import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "./dictionaries";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(requested ?? "") ? requested! : routing.defaultLocale;

  const [
    common,
    auth,
    app,
    landingNav,
    landingHome,
    landingProduct,
    landingResources,
    landingInstitutional,
    landingTransparency,
  ] = await Promise.all([
    import(`./dictionaries/${locale}/common.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/auth.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/landing-nav.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/landing-home.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/landing-product.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/landing-resources.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/landing-institutional.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/landing-transparency.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      ...common,
      ...auth,
      ...app,
      landing: {
        ...landingNav.landing,
        ...landingHome.landing,
        ...landingProduct.landing,
        ...landingResources.landing,
        ...landingInstitutional.landing,
        ...landingTransparency.landing,
      },
    },
  };
});
