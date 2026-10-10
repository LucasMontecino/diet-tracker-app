import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const foods = sqliteTable('foods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  servingLabel: text('serving_label').notNull(),
  kcal: real('kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  isAlcohol: integer('is_alcohol', { mode: 'boolean' }).notNull().default(false),
  alcoholMl: real('alcohol_ml'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
})

export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  mealType: text('meal_type').notNull(),
  foodId: integer('food_id'),
  name: text('name').notNull(),
  quantity: real('quantity').notNull(),
  kcal: real('kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  alcoholMl: real('alcohol_ml'),
  note: text('note'),
  createdAt: text('created_at').notNull(),
})

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  type: text('type').notNull(),
  durationMin: integer('duration_min').notNull(),
  steps: integer('steps'),
  distanceKm: real('distance_km'),
  deviceKcal: real('device_kcal'),
  note: text('note'),
})

export const weighIns = sqliteTable('weigh_ins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().unique(),
  kg: real('kg').notNull(),
  note: text('note'),
})

export const days = sqliteTable('days', {
  date: text('date').primaryKey(),
  isFreeMeal: integer('is_free_meal', { mode: 'boolean' }).notNull().default(false),
  expenditureOverrideKcal: real('expenditure_override_kcal'),
  notes: text('notes'),
})

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})
