import type { Locale } from "@/i18n/dictionaries";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  return <div lang={lang}>{children}</div>;
}

export async function generateStaticParams() {
  return [{ lang: "pt-BR" }, { lang: "en-US" }];
}
