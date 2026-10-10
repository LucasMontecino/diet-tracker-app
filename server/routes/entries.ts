import type { FastifyInstance } from 'fastify'
import { and, eq } from 'drizzle-orm'
import {
  copyEntriesSchema,
  entryWriteSchema,
  isoDate,
  type MealType,
} from '../../shared/schemas.ts'
import type { Db } from '../db/client.ts'
import { entries, foods } from '../db/schema.ts'
import { z } from 'zod'

const copyBody = z.union([
  copyEntriesSchema,
  z.object({
    from_date: isoDate,
    to_date: isoDate,
    meal_type: copyEntriesSchema.shape.mealType,
  }),
])

export function entryRoutes(app: FastifyInstance, db: Db) {
  app.get('/entries', async (req) => {
    const date = isoDate.parse((req.query as { date?: string }).date)
    return db.select().from(entries).where(eq(entries.date, date)).all()
  })

  app.post('/entries', async (req, reply) => {
    const body = entryWriteSchema.parse(req.body)
    const computed = resolveEntryMacros(db, body)
    const row = db
      .insert(entries)
      .values({
        date: body.date,
        mealType: body.mealType,
        foodId: body.foodId ?? null,
        name: computed.name,
        quantity: body.quantity,
        kcal: computed.kcal,
        proteinG: computed.proteinG,
        alcoholMl: computed.alcoholMl,
        note: body.note ?? null,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get()
    return reply.code(201).send(row)
  })

  app.patch('/entries/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id)
    const body = entryWriteSchema.partial().parse(req.body)
    const current = db.select().from(entries).where(eq(entries.id, id)).get()
    if (!current) return reply.code(404).send({ error: 'Entrada no encontrada' })
    const merged = {
      date: body.date ?? current.date,
      mealType: (body.mealType ?? current.mealType) as MealType,
      foodId: body.foodId === undefined ? current.foodId : body.foodId,
      name: body.name ?? current.name,
      quantity: body.quantity ?? current.quantity,
      kcal: body.kcal,
      proteinG: body.proteinG,
      alcoholMl: body.alcoholMl,
      note: body.note === undefined ? current.note : body.note,
    }
    const computed = resolveEntryMacros(db, merged)
    const row = db
      .update(entries)
      .set({
        date: merged.date,
        mealType: merged.mealType,
        foodId: merged.foodId ?? null,
        name: computed.name,
        quantity: merged.quantity,
        kcal: computed.kcal,
        proteinG: computed.proteinG,
        alcoholMl: computed.alcoholMl,
        note: merged.note ?? null,
      })
      .where(eq(entries.id, id))
      .returning()
      .get()
    return row
  })

  app.delete('/entries/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id)
    const row = db.delete(entries).where(eq(entries.id, id)).returning().get()
    if (!row) return reply.code(404).send({ error: 'Entrada no encontrada' })
    return { ok: true }
  })

  app.post('/entries/copy', async (req, reply) => {
    const raw = copyBody.parse(req.body)
    const fromDate = 'fromDate' in raw ? raw.fromDate : raw.from_date
    const toDate = 'toDate' in raw ? raw.toDate : raw.to_date
    const mealType = 'mealType' in raw ? raw.mealType : raw.meal_type
    const source = db
      .select()
      .from(entries)
      .where(and(eq(entries.date, fromDate), eq(entries.mealType, mealType)))
      .all()
    const now = new Date().toISOString()
    const copied = source.map((row) =>
      db
        .insert(entries)
        .values({
          date: toDate,
          mealType,
          foodId: row.foodId,
          name: row.name,
          quantity: row.quantity,
          kcal: row.kcal,
          proteinG: row.proteinG,
          alcoholMl: row.alcoholMl,
          note: row.note,
          createdAt: now,
        })
        .returning()
        .get(),
    )
    return reply.code(201).send(copied)
  })
}

function resolveEntryMacros(
  db: Db,
  body: {
    foodId?: number | null
    name: string
    quantity: number
    kcal?: number
    proteinG?: number
    alcoholMl?: number | null
  },
) {
  if (body.foodId) {
    const food = db.select().from(foods).where(eq(foods.id, body.foodId)).get()
    if (!food) throw new Error('Alimento no encontrado')
    return {
      name: food.name,
      kcal: food.kcal * body.quantity,
      proteinG: food.proteinG * body.quantity,
      alcoholMl: food.alcoholMl == null ? null : food.alcoholMl * body.quantity,
    }
  }
  return {
    name: body.name,
    kcal: body.kcal ?? 0,
    proteinG: body.proteinG ?? 0,
    alcoholMl: body.alcoholMl ?? null,
  }
}
