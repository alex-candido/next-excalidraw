import type { Locale } from "@/i18n/dictionaries";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const { default: Content } = await import(
    `@/content/landing/${lang}/support/contact.mdx`
  );

  return (
    <main>
      <Content />
    </main>
  );
}
