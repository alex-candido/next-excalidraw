"use client";

import { AppProviders } from "@/providers/app";
import { QueryProvider } from "@/providers/next/query-provider";
import { ThemeProvider } from "@/providers/next/theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AppProviders>{children}</AppProviders>
      </QueryProvider>
    </ThemeProvider>
  );
}
