import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const dataDir = path.join(root, 'data')
export const dbPath = path.join(dataDir, 'diet.db')

export function getDb() {
  fs.mkdirSync(dataDir, { recursive: true })
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  return drizzle(sqlite, { schema })
}

export type Db = ReturnType<typeof getDb>
