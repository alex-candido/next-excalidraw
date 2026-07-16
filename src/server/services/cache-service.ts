import { cacheRepository } from "@/server/repositories/cache-repository"

export function cacheService() {
  async function getOrSet<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await cacheRepository().get(key)
    if (cached !== null) return cached as T

    const value = await fn()
    await cacheRepository().set(key, value, ttlSeconds)
    return value
  }

  return { getOrSet }
}
