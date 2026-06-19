import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutFooter } from "@/components/layouts/layout-footer";
import { LayoutFooterBottom } from "@/components/layouts/layout-footer-bottom";
import { LayoutFooterColumns } from "@/components/layouts/layout-footer-columns";
import { LandingFooterBrand } from "@/components/landing/landing-footer-brand";
import { LandingFooterCopyright } from "@/components/landing/landing-footer-copyright";
import { LandingFooterNav } from "@/components/landing/landing-footer-nav";

export async function LandingLayoutFooter() {
  const t = await getTranslations("landing.footer.nav");

  const navigation = [
    {
      label: t("product.label"),
      links: [
        { label: t("product.features"), href: "/landing/home#features" },
        { label: t("product.pricing"), href: "/landing/home#pricing" },
        { label: t("product.updates"), href: "/landing/product/updates" },
      ],
    },
    {
      label: t("resources.label"),
      links: [
        { label: t("resources.blog"), href: "/landing/resources/blog" },
        { label: t("resources.about"), href: "/landing/institutional/about" },
      ],
    },
    {
      label: t("legal.label"),
      links: [
        { label: t("legal.privacy"), href: "/landing/transparency/privacy-policy" },
        { label: t("legal.terms"), href: "/landing/transparency/terms" },
      ],
    },
  ];

  return (
    <LayoutFooter>
      <LayoutContainer className="flex-col items-start gap-10">
        <LayoutFooterColumns>
          <LandingFooterBrand />
          {navigation.map(({ label, links }) => (
            <LandingFooterNav key={label} label={label} links={links} />
          ))}
        </LayoutFooterColumns>
        <LayoutFooterBottom>
          <LandingFooterCopyright />
        </LayoutFooterBottom>
      </LayoutContainer>
    </LayoutFooter>
  );
}
