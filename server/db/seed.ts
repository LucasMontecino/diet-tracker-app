import { eq } from 'drizzle-orm'
import { DEFAULT_SETTINGS } from '../../shared/schemas.ts'
import { getDb } from './client.ts'
import { FOOD_SEED } from './foods-seed.ts'
import { foods, settings } from './schema.ts'

export function seedDatabase(opts: { foodsOnly?: boolean } = {}) {
  const db = getDb()
  const now = new Date().toISOString()

  if (!opts.foodsOnly) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = db.select().from(settings).where(eq(settings.key, key)).get()
      if (!existing) {
        db.insert(settings)
          .values({ key, value: String(value) })
          .run()
      }
    }
  }

  const existingFoods = db.select().from(foods).all()
  const names = new Set(existingFoods.map((f) => f.name.toLowerCase()))
  let inserted = 0
  for (const food of FOOD_SEED) {
    if (names.has(food.name.toLowerCase())) continue
    db.insert(foods)
      .values({
        name: food.name,
        servingLabel: food.servingLabel,
        kcal: food.kcal,
        proteinG: food.proteinG,
        isAlcohol: (food.alcoholMl ?? 0) > 0,
        alcoholMl: food.alcoholMl ?? null,
        isFavorite: food.favorite ?? false,
        createdAt: now,
      })
      .run()
    inserted += 1
  }
  return { inserted }
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
  console.log('Seed listo.')
}
