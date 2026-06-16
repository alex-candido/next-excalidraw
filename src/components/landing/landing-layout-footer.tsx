import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutFooter } from "@/components/layouts/layout-footer";
import { LayoutFooterBottom } from "@/components/layouts/layout-footer-bottom";
import { LayoutFooterColumns } from "@/components/layouts/layout-footer-columns";

import { LandingFooterBrand } from "@/components/landing/landing-footer-brand";
import { LandingFooterCopyright } from "@/components/landing/landing-footer-copyright";
import { LandingFooterNav } from "@/components/landing/landing-footer-nav";

const navigation = [
  {
    label: "Product",
    links: [
      { label: "Features", href: "/landing/home#features" },
      { label: "Pricing", href: "/landing/home#pricing" },
      { label: "Updates", href: "/landing/product/updates" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Blog", href: "/landing/resources/blog" },
      { label: "About", href: "/landing/institutional/about" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy Policy", href: "/landing/transparency/privacy-policy" },
      { label: "Terms of Use", href: "/landing/transparency/terms" },
    ],
  },
] as const;

export function LandingLayoutFooter() {
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
