import { Role, type RoleKey } from "@/lib/drizzle/schema/auth-schema";

export { Role };
export type { RoleKey };

export const roleRedirects: Record<RoleKey, string> = {
  admin: "/admin/dashboard",
  member: "/app/dashboard",
  guest: "/app/dashboard",
  viewer: "/app/dashboard",
};

export const roleAllowedRoutes: Record<RoleKey, string[]> = {
  admin: ["/admin", "/app"],
  member: ["/app"],
  guest: ["/app"],
  viewer: ["/app"],
};

export function getRoleKey(value: number): RoleKey {
  const entry = Object.entries(Role).find(([, v]) => v === value);
  return (entry?.[0] ?? "guest") as RoleKey;
}
