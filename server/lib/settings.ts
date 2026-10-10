import { eq } from 'drizzle-orm'
import {
  appSettingsSchema,
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../../shared/schemas.ts'
import type { Db } from '../db/client.ts'
import { settings } from '../db/schema.ts'

function parseValue(raw: string): string | number | boolean {
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw)
  return raw
}

export function readSettings(db: Db): AppSettings {
  const rows = db.select().from(settings).all()
  const raw: Record<string, unknown> = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    raw[row.key] = parseValue(row.value)
  }
  return appSettingsSchema.parse(raw)
}

export function writeSettings(db: Db, patch: Partial<AppSettings>) {
  const next = appSettingsSchema.parse({ ...readSettings(db), ...patch })
  for (const [key, value] of Object.entries(next)) {
    const stored = typeof value === 'boolean' ? String(value) : String(value)
    const existing = db.select().from(settings).where(eq(settings.key, key)).get()
    if (existing) {
      db.update(settings).set({ value: stored }).where(eq(settings.key, key)).run()
    } else {
      db.insert(settings).values({ key, value: stored }).run()
    }
  }
  return next
}
