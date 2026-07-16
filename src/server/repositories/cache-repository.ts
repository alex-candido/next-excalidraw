import { db } from "@/lib/drizzle"
import { cache } from "@/lib/drizzle/schema/cache"
import { and, eq, gt, lte } from "drizzle-orm"

export function cacheRepository() {
  async function get(key: string) {
    const row = await db.query.cache.findFirst({
      where: and(eq(cache.key, key), gt(cache.expiresAt, new Date())),
    })
    return row?.value ?? null
  }

  async function set(key: string, value: unknown, ttlSeconds: number) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
    await db
      .insert(cache)
      .values({ key, value, expiresAt })
      .onConflictDoUpdate({ target: cache.key, set: { value, expiresAt } })
  }

  async function del(key: string) {
    await db.delete(cache).where(eq(cache.key, key))
  }

  async function deleteExpired() {
    await db.delete(cache).where(lte(cache.expiresAt, new Date()))
  }

  return { get, set, del, deleteExpired }
}
