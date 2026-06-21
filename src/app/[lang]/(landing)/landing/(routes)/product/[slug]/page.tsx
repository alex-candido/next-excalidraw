import { notFound } from "next/navigation";

import { LandingProductMultiAudience } from "@/components/landing/product/multi/landing-product-multi-audience";
import { LandingProductMultiCapabilities } from "@/components/landing/product/multi/landing-product-multi-capabilities";
import { LandingProductMultiCta } from "@/components/landing/product/multi/landing-product-multi-cta";
import { LandingProductMultiHero } from "@/components/landing/product/multi/landing-product-multi-hero";
import { LandingProductMultiHowItWorks } from "@/components/landing/product/multi/landing-product-multi-how-it-works";
import { LandingProductMultiModalities } from "@/components/landing/product/multi/landing-product-multi-modalities";
import { LandingProductSingleCta } from "@/components/landing/product/single/landing-product-single-cta";
import { LandingProductSingleHero } from "@/components/landing/product/single/landing-product-single-hero";
import { LandingProductSingleInputs } from "@/components/landing/product/single/landing-product-single-inputs";
import { LandingProductSingleVersions } from "@/components/landing/product/single/landing-product-single-versions";

const slugs = ["multi", "single"] as const;

type Slug = (typeof slugs)[number];

function isValidSlug(slug: string): slug is Slug {
  return (slugs as readonly string[]).includes(slug);
}

function LandingProductMultiPage() {
  return (
    <>
      <LandingProductMultiHero />
      <LandingProductMultiHowItWorks />
      <LandingProductMultiModalities />
      <LandingProductMultiAudience />
      <LandingProductMultiCapabilities />
      <LandingProductMultiCta />
    </>
  );
}

function LandingProductSinglePage() {
  return (
    <>
      <LandingProductSingleHero />
      <LandingProductSingleInputs />
      <LandingProductSingleVersions />
      <LandingProductSingleCta />
    </>
  );
}

const pages: Record<Slug, React.FC> = {
  multi: LandingProductMultiPage,
  single: LandingProductSinglePage,
};

export default async function ProductSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isValidSlug(slug)) notFound();

  const Content = pages[slug];

  return (
    <div className={`landing-product-${slug}-page`}>
      <Content />
    </div>
  );
}
