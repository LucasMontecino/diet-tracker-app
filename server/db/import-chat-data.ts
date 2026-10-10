import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq, inArray } from 'drizzle-orm'
import type { MealType } from '../../shared/schemas.ts'
import { getDb } from './client.ts'
import { activities, days, entries, foods } from './schema.ts'
import { seedDatabase } from './seed.ts'

type ChatDay = {
  date: string
  is_free_meal: boolean
  complete?: boolean
  chat_totals?: { kcal: number; protein_g: number }
  notes?: string
}

type ChatEntry = {
  date: string
  meal_type: MealType
  food_name: string | null
  name: string
  quantity: number
  kcal: number
  protein_g: number
  alcohol_ml?: number | null
  note?: string | null
  assumed?: boolean
}

type ChatActivity = {
  date: string
  type: 'walk' | 'crossfit' | 'other'
  duration_min: number | null
  steps: number | null
  distance_km: number | null
  device_kcal: number | null
  note: string | null
}

type ChatPayload = {
  days: ChatDay[]
  entries: ChatEntry[]
  activities: ChatActivity[]
  weigh_ins: unknown[]
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const defaultDataPath = path.join(root, 'server/db/chat-import-data.json')

function loadPayload(filePath: string): ChatPayload {
  const raw = fs.readFileSync(filePath, 'utf8')
  let jsonText = raw.trim()
  const block = raw.match(/```json\s*([\s\S]*?)```/)
  if (block) jsonText = block[1].trim()
  const parsed = JSON.parse(jsonText) as ChatPayload
  if (!parsed.days?.length || !parsed.entries?.length) {
    throw new Error('El archivo no tiene days o entries')
  }
  return parsed
}

function resolveNote(entry: ChatEntry): string | null {
  const parts: string[] = []
  if (entry.note?.trim()) parts.push(entry.note.trim())
  if (entry.assumed) parts.push('(asumido)')
  return parts.length ? parts.join(' ') : null
}

export function importChatData(filePath: string) {
  seedDatabase()
  const payload = loadPayload(filePath)
  const db = getDb()
  const dates = [...new Set(payload.days.map((d) => d.date))].sort()

  const foodRows = db.select().from(foods).all()
  const foodByName = new Map(foodRows.map((f) => [f.name.toLowerCase(), f.id]))
  const unmatchedFoods = new Set<string>()

  db.transaction((tx) => {
    tx.delete(entries).where(inArray(entries.date, dates)).run()
    tx.delete(activities).where(inArray(activities.date, dates)).run()

    for (const day of payload.days) {
      const noteText = day.notes?.trim() || null
      const existing = tx.select().from(days).where(eq(days.date, day.date)).get()
      if (existing) {
        tx.update(days)
          .set({
            isFreeMeal: day.is_free_meal,
            notes: noteText ?? existing.notes,
          })
          .where(eq(days.date, day.date))
          .run()
      } else {
        tx.insert(days)
          .values({
            date: day.date,
            isFreeMeal: day.is_free_meal,
            expenditureOverrideKcal: null,
            notes: noteText,
          })
          .run()
      }
    }

    const createdAt = new Date().toISOString()
    for (const entry of payload.entries) {
      let foodId: number | null = null
      if (entry.food_name) {
        foodId = foodByName.get(entry.food_name.toLowerCase()) ?? null
        if (!foodId) unmatchedFoods.add(entry.food_name)
      }

      tx.insert(entries)
        .values({
          date: entry.date,
          mealType: entry.meal_type,
          foodId,
          name: entry.name,
          quantity: entry.quantity,
          kcal: entry.kcal,
          proteinG: entry.protein_g,
          alcoholMl: entry.alcohol_ml ?? null,
          note: resolveNote(entry),
          createdAt,
        })
        .run()
    }

    for (const act of payload.activities) {
      tx.insert(activities)
        .values({
          date: act.date,
          type: act.type,
          durationMin: act.duration_min ?? 0,
          steps: act.steps,
          distanceKm: act.distance_km,
          deviceKcal: act.device_kcal,
          note: act.note,
        })
        .run()
    }
  })

  console.log(`Importadas ${payload.entries.length} entradas y ${payload.activities.length} actividades en ${dates.length} días.`)

  if (unmatchedFoods.size) {
    console.log('\nAlimentos sin match en catálogo (entrada importada con food_id null):')
    for (const name of [...unmatchedFoods].sort()) console.log(`  - ${name}`)
  }

  console.log('\nValidación vs chat_totals:')
  let ok = 0
  let warn = 0
  for (const day of payload.days) {
    const rows = db.select().from(entries).where(eq(entries.date, day.date)).all()
    const kcal = Math.round(rows.reduce((s, r) => s + r.kcal, 0))
    const protein = Math.round(rows.reduce((s, r) => s + r.proteinG, 0))
    const expected = day.chat_totals
    if (!expected) continue
    const dk = kcal - expected.kcal
    const dp = protein - expected.protein_g
    const match = Math.abs(dk) <= 8 && Math.abs(dp) <= 2
    if (match) ok += 1
    else warn += 1
    const flag = match ? 'OK' : 'DIFF'
    console.log(
      `  ${day.date} [${flag}] importado ${kcal} kcal / ${protein} g  ·  chat ${expected.kcal} / ${expected.protein_g}  (Δ ${dk} kcal, Δ ${dp} g)`,
    )
  }
  console.log(`\nResumen: ${ok} días OK, ${warn} con diferencia mayor al redondeo.`)

  return { dates: dates.length, entries: payload.entries.length, activities: payload.activities.length }
}

if (process.argv[1]?.includes('import-chat-data.ts')) {
  const argPath = process.argv[2]
  const filePath = argPath
    ? path.resolve(argPath)
    : fs.existsSync(defaultDataPath)
      ? defaultDataPath
      : path.join(process.env.USERPROFILE ?? '', 'Downloads/diet-tracker-data.md')

  if (!fs.existsSync(filePath)) {
    console.error(`No se encontró el archivo: ${filePath}`)
    process.exit(1)
  }
  importChatData(filePath)
}
