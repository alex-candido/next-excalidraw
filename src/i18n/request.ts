import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "./dictionaries";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(requested ?? "") ? requested! : routing.defaultLocale;

  const [
    common,
    auth,
    appNav,
    appDashboard,
    appPresentations,
    appTemplates,
    appCommunity,
    appNew,
    appOutline,
    appStudio,
    landingNav,
    landingHome,
    landingProduct,
    landingResources,
    landingInstitutional,
    landingTransparency,
  ] = await Promise.all([
    import(`./dictionaries/${locale}/common.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/auth.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app-nav.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app-dashboard.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app-presentations.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app-templates.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app-community.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app-new.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app-outline.json`).then((m) => m.default),
    import(`./dictionaries/${locale}/app-studio.json`).then((m) => m.default),
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
      app: {
        ...appNav.app,
        ...appDashboard.app,
        ...appPresentations.app,
        ...appTemplates.app,
        ...appCommunity.app,
        ...appNew.app,
        ...appOutline.app,
        ...appStudio.app,
      },
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
