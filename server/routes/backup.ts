import type { FastifyInstance } from 'fastify'
import { backupSchema } from '../../shared/schemas.ts'
import type { Db } from '../db/client.ts'
import { activities, days, entries, foods, settings, weighIns } from '../db/schema.ts'
import { readSettings, writeSettings } from '../lib/settings.ts'

export function backupRoutes(app: FastifyInstance, db: Db) {
  app.get('/backup/export', async () => {
    return {
      foods: db.select().from(foods).all(),
      entries: db.select().from(entries).all(),
      activities: db.select().from(activities).all(),
      weighIns: db.select().from(weighIns).all(),
      days: db.select().from(days).all(),
      settings: readSettings(db),
    }
  })

  app.post('/backup/import', async (req) => {
    const payload = backupSchema.parse(req.body)
    db.delete(entries).run()
    db.delete(activities).run()
    db.delete(weighIns).run()
    db.delete(days).run()
    db.delete(foods).run()
    db.delete(settings).run()

    if (payload.foods.length) db.insert(foods).values(payload.foods).run()
    if (payload.entries.length) db.insert(entries).values(payload.entries).run()
    if (payload.activities.length) db.insert(activities).values(payload.activities).run()
    if (payload.weighIns.length) db.insert(weighIns).values(payload.weighIns).run()
    if (payload.days.length) db.insert(days).values(payload.days).run()
    writeSettings(db, payload.settings)
    return { ok: true }
  })
}
