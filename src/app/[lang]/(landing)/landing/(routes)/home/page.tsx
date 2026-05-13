import { ThemeToggle } from "@/components/ui/base/theme-toggle";
import type { Locale } from "@/i18n/dictionaries";

export default async function LandingHomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const { default: Content } = await import(
    `@/content/landing/${lang}/home.mdx`
  );

  return (
    <main>
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <Content />
    </main>
  );
}
