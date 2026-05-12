"use client";

import { createContext, useContext, useState } from "react";

interface AppContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProviders");
  return context;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const value: AppContextValue = {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
