import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env.local' })
config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` })

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/drizzle/schema',
  out: './src/lib/drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
