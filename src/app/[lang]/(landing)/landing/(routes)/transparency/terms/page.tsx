import type { Locale } from "@/i18n/dictionaries";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const { default: Content } = await import(
    `@/content/landing/${lang}/transparency/terms.mdx`
  );

  return (
    <main>
      <Content />
    </main>
  );
}
