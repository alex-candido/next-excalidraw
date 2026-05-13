import type { Locale } from "@/i18n/dictionaries";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const { default: Content } = await import(
    `@/content/landing/${lang}/docs/index.mdx`
  );

  return (
    <main>
      <Content />
    </main>
  );
}
