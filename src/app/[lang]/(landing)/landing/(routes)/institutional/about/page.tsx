import type { Locale } from "@/i18n/dictionaries";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const { default: Content } = await import(
    `@/content/landing/${lang}/institutional/about.mdx`
  );

  return (
    <main>
      <Content />
    </main>
  );
}
