"use client";

import { AppPresentationsOutlineProvider } from "./app-presentations-outline-provider";
import { AppPresentationsPresentProvider } from "./app-presentations-present-provider";
import { AppPresentationsStudioProvider } from "./app-presentations-studio-provider";
import { AppProvider } from "./app-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppPresentationsOutlineProvider>
        <AppPresentationsStudioProvider>
          <AppPresentationsPresentProvider>
            {children}
          </AppPresentationsPresentProvider>
        </AppPresentationsStudioProvider>
      </AppPresentationsOutlineProvider>
    </AppProvider>
  )
}