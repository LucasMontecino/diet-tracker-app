import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { weighInWriteSchema } from '../../shared/schemas.ts'
import type { Db } from '../db/client.ts'
import { weighIns } from '../db/schema.ts'

export function weightRoutes(app: FastifyInstance, db: Db) {
  app.get('/weights', async () => {
    return db.select().from(weighIns).all().sort((a, b) => a.date.localeCompare(b.date))
  })

  app.post('/weights', async (req, reply) => {
    const body = weighInWriteSchema.parse(req.body)
    const existing = db.select().from(weighIns).where(eq(weighIns.date, body.date)).get()
    if (existing) {
      const row = db
        .update(weighIns)
        .set({ kg: body.kg, note: body.note ?? null })
        .where(eq(weighIns.id, existing.id))
        .returning()
        .get()
      return row
    }
    const row = db.insert(weighIns).values(body).returning().get()
    return reply.code(201).send(row)
  })

  app.patch('/weights/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id)
    const body = weighInWriteSchema.partial().parse(req.body)
    const row = db.update(weighIns).set(body).where(eq(weighIns.id, id)).returning().get()
    if (!row) return reply.code(404).send({ error: 'Pesaje no encontrado' })
    return row
  })

  app.delete('/weights/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id)
    const row = db.delete(weighIns).where(eq(weighIns.id, id)).returning().get()
    if (!row) return reply.code(404).send({ error: 'Pesaje no encontrado' })
    return { ok: true }
  })
}
