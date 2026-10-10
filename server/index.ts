import Fastify from 'fastify'
import cors from '@fastify/cors'
import { ZodError } from 'zod'
import { getDb } from './db/client.ts'
import { activityRoutes } from './routes/activities.ts'
import { backupRoutes } from './routes/backup.ts'
import { dayRoutes } from './routes/days.ts'
import { entryRoutes } from './routes/entries.ts'
import { foodRoutes } from './routes/foods.ts'
import { settingsRoutes } from './routes/settings.ts'
import { weightRoutes } from './routes/weights.ts'

const db = getDb()
const app = Fastify({ logger: true })
await app.register(cors, { origin: true })

app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError) {
    return reply.code(400).send({ error: 'Datos inválidos', details: err.issues })
  }
  app.log.error(err)
  return reply.code(500).send({ error: err.message })
})

await app.register(
  async (api) => {
    foodRoutes(api, db)
    entryRoutes(api, db)
    activityRoutes(api, db)
    weightRoutes(api, db)
    dayRoutes(api, db)
    settingsRoutes(api, db)
    backupRoutes(api, db)
  },
  { prefix: '/api' },
)

const port = Number(process.env.PORT ?? 3001)
await app.listen({ port, host: '0.0.0.0' })
console.log(`API en http://localhost:${port}`)
