import type { Locale } from "@/i18n/dictionaries";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const { default: Content } = await import(
    `@/content/landing/${lang}/resources/blog.mdx`
  );

  return (
    <main>
      <Content />
    </main>
  );
}
