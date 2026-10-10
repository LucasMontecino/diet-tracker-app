import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { activityWriteSchema, isoDate } from '../../shared/schemas.ts'
import type { Db } from '../db/client.ts'
import { activities } from '../db/schema.ts'

export function activityRoutes(app: FastifyInstance, db: Db) {
  app.get('/activities', async (req) => {
    const date = (req.query as { date?: string }).date
    if (date) {
      isoDate.parse(date)
      return db.select().from(activities).where(eq(activities.date, date)).all()
    }
    return db.select().from(activities).all()
  })

  app.post('/activities', async (req, reply) => {
    const body = activityWriteSchema.parse(req.body)
    const row = db.insert(activities).values(body).returning().get()
    return reply.code(201).send(row)
  })

  app.patch('/activities/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id)
    const body = activityWriteSchema.partial().parse(req.body)
    const row = db.update(activities).set(body).where(eq(activities.id, id)).returning().get()
    if (!row) return reply.code(404).send({ error: 'Actividad no encontrada' })
    return row
  })

  app.delete('/activities/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id)
    const row = db.delete(activities).where(eq(activities.id, id)).returning().get()
    if (!row) return reply.code(404).send({ error: 'Actividad no encontrada' })
    return { ok: true }
  })
}
