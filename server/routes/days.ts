import type { FastifyInstance } from 'fastify'
import { and, eq, gte, lte } from 'drizzle-orm'
import { dayUpdateSchema, isoDate, MEAL_TYPES } from '../../shared/schemas.ts'
import {
  autoSuggestions,
  movingAverage7,
  summarizeDay,
} from '../../src/lib/calc.ts'
import type { Db } from '../db/client.ts'
import { activities, days, entries, weighIns } from '../db/schema.ts'
import { readSettings } from '../lib/settings.ts'

export function dayRoutes(app: FastifyInstance, db: Db) {
  app.get('/days/:date', async (req) => {
    const date = isoDate.parse((req.params as { date: string }).date)
    const settings = readSettings(db)
    const dayEntries = db.select().from(entries).where(eq(entries.date, date)).all()
    const dayActivities = db.select().from(activities).where(eq(activities.date, date)).all()
    const dayMeta = db.select().from(days).where(eq(days.date, date)).get() ?? null
    const summary = summarizeDay({
      date,
      settings,
      entries: dayEntries as never,
      activities: dayActivities as never,
      dayMeta: dayMeta as never,
    })
    const grouped = Object.fromEntries(
      MEAL_TYPES.map((meal) => [meal, dayEntries.filter((e) => e.mealType === meal)]),
    )
    return {
      ...summary,
      settings,
      entries: dayEntries,
      entriesByMeal: grouped,
      activities: dayActivities,
      dayMeta,
    }
  })

  app.put('/days/:date', async (req) => {
    const date = isoDate.parse((req.params as { date: string }).date)
    const body = dayUpdateSchema.parse(req.body)
    const existing = db.select().from(days).where(eq(days.date, date)).get()
    if (existing) {
      return db
        .update(days)
        .set({
          isFreeMeal: body.isFreeMeal ?? existing.isFreeMeal,
          expenditureOverrideKcal:
            body.expenditureOverrideKcal === undefined
              ? existing.expenditureOverrideKcal
              : body.expenditureOverrideKcal,
          notes: body.notes === undefined ? existing.notes : body.notes,
        })
        .where(eq(days.date, date))
        .returning()
        .get()
    }
    return db
      .insert(days)
      .values({
        date,
        isFreeMeal: body.isFreeMeal ?? false,
        expenditureOverrideKcal: body.expenditureOverrideKcal ?? null,
        notes: body.notes ?? null,
      })
      .returning()
      .get()
  })

  app.get('/trends', async (req) => {
    const q = req.query as { from?: string; to?: string }
    const from = isoDate.parse(q.from)
    const to = isoDate.parse(q.to)
    const settings = readSettings(db)
    const allEntries = db
      .select()
      .from(entries)
      .where(and(gte(entries.date, from), lte(entries.date, to)))
      .all()
    const allActivities = db
      .select()
      .from(activities)
      .where(and(gte(activities.date, from), lte(activities.date, to)))
      .all()
    const allDays = db
      .select()
      .from(days)
      .where(and(gte(days.date, from), lte(days.date, to)))
      .all()
    const weights = db.select().from(weighIns).all()
    const dates: string[] = []
    let cursor = from
    while (cursor <= to) {
      dates.push(cursor)
      const [y, m, d] = cursor.split('-').map(Number)
      const next = new Date(y, m - 1, d + 1)
      cursor = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
    }

    const series = dates.map((date) => {
      const dayEntries = allEntries.filter((e) => e.date === date)
      const dayActivities = allActivities.filter((a) => a.date === date)
      const dayMeta = allDays.find((d) => d.date === date) ?? null
      const summary = summarizeDay({
        date,
        settings,
        entries: dayEntries as never,
        activities: dayActivities as never,
        dayMeta: dayMeta as never,
      })
      const weight = weights.find((w) => w.date === date)?.kg ?? null
      const steps = dayActivities.reduce((s, a) => s + (a.steps ?? 0), 0)
      return {
        ...summary,
        steps,
        weight,
        weightAvg7: movingAverage7(weights, date),
      }
    })

    const suggestions = autoSuggestions({
      weighIns: weights,
      dailyBalances: series.map((d) => ({ date: d.date, balance: d.balance })),
      endDate: to,
    })

    return { series, suggestions, settings }
  })
}
