import { PermissionType } from "@/lib/drizzle/schema/user-permission"
import { permissionRepository } from "@/server/repositories/auth/permission-repository"

export function permissionService() {
  async function getUserPermissions(userId: string) {
    const [{ groupName, permissionKeys }, overrides] = await Promise.all([
      permissionRepository().findGroupWithPermissions(userId),
      permissionRepository().findUserPermissionOverrides(userId),
    ])

    const resolved = new Set(permissionKeys)
    for (const override of overrides) {
      if (override.type === PermissionType.grant) resolved.add(override.key)
      if (override.type === PermissionType.deny) resolved.delete(override.key)
    }

    return { group: groupName, permissions: [...resolved] }
  }

  async function hasPermission(userId: string, key: string) {
    const { permissions } = await getUserPermissions(userId)
    return permissions.includes(key)
  }

  return { getUserPermissions, hasPermission }
}
