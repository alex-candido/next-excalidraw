export const GroupName = {
  admin: "admin",
  member: "member",
  guest: "guest",
  viewer: "viewer",
} as const;

export type GroupNameKey = keyof typeof GroupName;

export const groupRedirects: Record<GroupNameKey, string> = {
  admin: "/admin/dashboard",
  member: "/app/dashboard",
  guest: "/app/dashboard",
  viewer: "/app/dashboard",
};

export const groupAllowedRoutes: Record<GroupNameKey, string[]> = {
  admin: ["/admin", "/app"],
  member: ["/app"],
  guest: ["/app"],
  viewer: ["/app"],
};

export function getGroupNameKey(name: string): GroupNameKey {
  return (Object.values(GroupName).includes(name as GroupNameKey) ? name : "guest") as GroupNameKey;
}
