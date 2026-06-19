import { notFound } from "next/navigation";

const slugs = ["multi", "single"] as const;

type Slug = (typeof slugs)[number];

function isValidSlug(slug: string): slug is Slug {
  return (slugs as readonly string[]).includes(slug);
}

export default async function ProductSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isValidSlug(slug)) notFound();

  const { default: Content } = await import(
    `@/content/landing/product/${slug}/index.mdx`
  );

  return (
    <div className={`landing-product-${slug}-page`}>
      <Content />
    </div>
  );
}
