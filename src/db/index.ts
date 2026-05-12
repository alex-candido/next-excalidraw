import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { env } from '@/config/env-config'

const client = createClient({ url: env.DATABASE_URL })

export const db = drizzle(client)
