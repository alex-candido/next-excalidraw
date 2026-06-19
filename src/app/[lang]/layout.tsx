import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import type { Locale } from "@/i18n/dictionaries";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const messages = await getMessages();

  return (
    <div lang={lang}>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}

export async function generateStaticParams() {
  return [{ lang: "pt-BR" }, { lang: "en-US" }];
}
