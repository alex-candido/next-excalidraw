import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/config/env-config'
import * as schema from './schema/auth-schema'

const client = postgres(env.DATABASE_URL)

export const db = drizzle(client, { schema })
