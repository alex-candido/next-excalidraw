"use client";

import { useAuth } from "@/hooks/use-auth";

export function usePermissions() {
  const { session } = useAuth();
  const permissions = session.data?.user.permissions ?? [];

  function hasPermission(key: string) {
    return permissions.includes(key);
  }

  return { permissions, hasPermission };
}
