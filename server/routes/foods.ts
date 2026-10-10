import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { foodWriteSchema } from '../../shared/schemas.ts'
import type { Db } from '../db/client.ts'
import { foods } from '../db/schema.ts'

export function foodRoutes(app: FastifyInstance, db: Db) {
  app.get('/foods', async () => {
    return db.select().from(foods).all().sort((a, b) => a.name.localeCompare(b.name, 'es'))
  })

  app.post('/foods', async (req, reply) => {
    const body = foodWriteSchema.parse(req.body)
    const row = db
      .insert(foods)
      .values({ ...body, createdAt: new Date().toISOString() })
      .returning()
      .get()
    return reply.code(201).send(row)
  })

  app.patch('/foods/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id)
    const body = foodWriteSchema.partial().parse(req.body)
    const row = db.update(foods).set(body).where(eq(foods.id, id)).returning().get()
    if (!row) return reply.code(404).send({ error: 'Alimento no encontrado' })
    return row
  })

  app.delete('/foods/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id)
    const row = db.delete(foods).where(eq(foods.id, id)).returning().get()
    if (!row) return reply.code(404).send({ error: 'Alimento no encontrado' })
    return { ok: true }
  })
}
