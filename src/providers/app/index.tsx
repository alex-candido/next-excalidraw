"use client";

import { AppStartProvider } from "./app-start-provider";
import { AppPresentationsListProvider } from "./app-presentations-list-provider";
import { AppPresentationsOutlineProvider } from "./app-presentations-outline-provider";
import { AppPresentationsPresentProvider } from "./app-presentations-present-provider";
import { AppPresentationsStudioProvider } from "./app-presentations-studio-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppStartProvider>
      <AppPresentationsListProvider>
        <AppPresentationsOutlineProvider>
          <AppPresentationsStudioProvider>
            <AppPresentationsPresentProvider>
              {children}
            </AppPresentationsPresentProvider>
          </AppPresentationsStudioProvider>
        </AppPresentationsOutlineProvider>
      </AppPresentationsListProvider>
    </AppStartProvider>
  )
}