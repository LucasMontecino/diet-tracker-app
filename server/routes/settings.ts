import type { FastifyInstance } from 'fastify'
import { appSettingsSchema } from '../../shared/schemas.ts'
import type { Db } from '../db/client.ts'
import { seedDatabase } from '../db/seed.ts'
import { readSettings, writeSettings } from '../lib/settings.ts'

export function settingsRoutes(app: FastifyInstance, db: Db) {
  app.get('/settings', async () => readSettings(db))

  app.put('/settings', async (req) => {
    const body = appSettingsSchema.partial().parse(req.body)
    return writeSettings(db, body)
  })

  app.post('/settings/reseed-foods', async () => {
    return seedDatabase({ foodsOnly: true })
  })
}
