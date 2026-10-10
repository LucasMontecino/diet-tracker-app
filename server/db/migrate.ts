import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getDb } from './client.ts'

const migrationsFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'migrations')
const db = getDb()
migrate(db, { migrationsFolder })
console.log('Migraciones aplicadas.')
