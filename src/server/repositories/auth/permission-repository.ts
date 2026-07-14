import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { userGroup } from "@/lib/drizzle/schema/user-group"
import { userPermission } from "@/lib/drizzle/schema/user-permission"

export function permissionRepository() {
  async function findGroupWithPermissions(userId: string) {
    const row = await db.query.userGroup.findFirst({
      where: eq(userGroup.userId, userId),
      with: {
        group: {
          with: { groupPermissions: { with: { permission: true } } },
        },
      },
    })

    return {
      groupName: row?.group.name ?? null,
      permissionKeys: row?.group.groupPermissions.map((gp) => gp.permission.key) ?? [],
    }
  }

  async function findUserPermissionOverrides(userId: string) {
    const rows = await db.query.userPermission.findMany({
      where: eq(userPermission.userId, userId),
      with: { permission: true },
    })

    return rows.map((row) => ({ key: row.permission.key, type: row.type }))
  }

  return { findGroupWithPermissions, findUserPermissionOverrides }
}
