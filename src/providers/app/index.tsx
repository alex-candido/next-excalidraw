"use client";

import { AppPresentationsOutlineProvider } from "./app-presentations-outline-provider";
import { AppProvider } from "./app-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppPresentationsOutlineProvider>
        {children}
      </AppPresentationsOutlineProvider>
    </AppProvider>
  )
}