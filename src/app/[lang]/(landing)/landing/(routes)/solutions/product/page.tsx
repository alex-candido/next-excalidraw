import type { Locale } from "@/i18n/dictionaries";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const { default: Content } = await import(
    `@/content/landing/${lang}/solutions/product.mdx`
  );

  return (
    <main>
      <Content />
    </main>
  );
}
