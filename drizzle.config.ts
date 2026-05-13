import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'turso',
  schema: './src/lib/drizzle/schema',
  out: './src/lib/drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
