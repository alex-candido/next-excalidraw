import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { env } from '@/config/env-config'
import * as schema from './schema/auth-schema'

const client = createClient({ url: env.DATABASE_URL })

export const db = drizzle(client, { schema })
