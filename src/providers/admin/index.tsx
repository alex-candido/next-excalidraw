"use client";

import { AdminProvider } from "./admin-provider";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
        {children}
    </AdminProvider>
  )
}