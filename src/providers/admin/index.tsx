"use client";

import { createContext, useContext, useState } from "react";

interface AdminContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProviders");
  return context;
}

export function AdminProviders({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const value: AdminContextValue = {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}
