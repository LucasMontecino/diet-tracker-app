import { z } from 'zod'

export const MEAL_TYPES = [
  'desayuno',
  'colacion_manana',
  'almuerzo',
  'colacion_tarde',
  'merienda',
  'cena',
  'extra',
] as const

export type MealType = (typeof MEAL_TYPES)[number]

export const MEAL_LABELS: Record<MealType, string> = {
  desayuno: 'Desayuno',
  colacion_manana: 'Colación mañana',
  almuerzo: 'Almuerzo',
  colacion_tarde: 'Colación tarde',
  merienda: 'Merienda',
  cena: 'Cena',
  extra: 'Extra',
}

export const ACTIVITY_TYPES = ['walk', 'crossfit', 'other'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walk: 'Caminata',
  crossfit: 'CrossFit',
  other: 'Otra',
}

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const foodSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  servingLabel: z.string(),
  kcal: z.number(),
  proteinG: z.number(),
  isAlcohol: z.boolean(),
  alcoholMl: z.number().nullable(),
  isFavorite: z.boolean(),
  createdAt: z.string(),
})

export const foodWriteSchema = z.object({
  name: z.string().min(1),
  servingLabel: z.string().min(1),
  kcal: z.number(),
  proteinG: z.number(),
  isAlcohol: z.boolean().optional().default(false),
  alcoholMl: z.number().nullable().optional().default(null),
  isFavorite: z.boolean().optional().default(false),
})

export const entrySchema = z.object({
  id: z.number().int(),
  date: isoDate,
  mealType: z.enum(MEAL_TYPES),
  foodId: z.number().int().nullable(),
  name: z.string(),
  quantity: z.number(),
  kcal: z.number(),
  proteinG: z.number(),
  alcoholMl: z.number().nullable(),
  note: z.string().nullable(),
  createdAt: z.string(),
})

export const entryWriteSchema = z.object({
  date: isoDate,
  mealType: z.enum(MEAL_TYPES),
  foodId: z.number().int().nullable().optional().default(null),
  name: z.string().min(1),
  quantity: z.number().positive(),
  kcal: z.number().optional(),
  proteinG: z.number().optional(),
  alcoholMl: z.number().nullable().optional(),
  note: z.string().nullable().optional().default(null),
})

export const copyEntriesSchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(MEAL_TYPES),
})

export const activitySchema = z.object({
  id: z.number().int(),
  date: isoDate,
  type: z.enum(ACTIVITY_TYPES),
  durationMin: z.number(),
  steps: z.number().nullable(),
  distanceKm: z.number().nullable(),
  deviceKcal: z.number().nullable(),
  note: z.string().nullable(),
})

export const activityWriteSchema = z.object({
  date: isoDate,
  type: z.enum(ACTIVITY_TYPES),
  durationMin: z.number().nonnegative(),
  steps: z.number().nullable().optional().default(null),
  distanceKm: z.number().nullable().optional().default(null),
  deviceKcal: z.number().nullable().optional().default(null),
  note: z.string().nullable().optional().default(null),
})

export const weighInSchema = z.object({
  id: z.number().int(),
  date: isoDate,
  kg: z.number(),
  note: z.string().nullable(),
})

export const weighInWriteSchema = z.object({
  date: isoDate,
  kg: z.number().positive(),
  note: z.string().nullable().optional().default(null),
})

export const dayMetaSchema = z.object({
  date: isoDate,
  isFreeMeal: z.boolean(),
  expenditureOverrideKcal: z.number().nullable(),
  notes: z.string().nullable(),
})

export const dayUpdateSchema = z.object({
  isFreeMeal: z.boolean().optional(),
  expenditureOverrideKcal: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const appSettingsSchema = z.object({
  baseline_rest_kcal: z.number(),
  baseline_gym_kcal: z.number(),
  deficit_kcal: z.number(),
  protein_min_g: z.number(),
  protein_target_g: z.number(),
  device_kcal_factor: z.number(),
  count_walk_extra: z.boolean(),
  walk_counts_on_gym_days: z.boolean(),
  max_alcohol_drinks_per_day: z.number(),
  goal_loss_kg: z.number(),
  goal_date: isoDate,
  start_weight_kg: z.number(),
  height_cm: z.number(),
  age: z.number(),
  sex: z.string(),
})

export type AppSettings = z.infer<typeof appSettingsSchema>
export type Food = z.infer<typeof foodSchema>
export type Entry = z.infer<typeof entrySchema>
export type Activity = z.infer<typeof activitySchema>
export type WeighIn = z.infer<typeof weighInSchema>
export type DayMeta = z.infer<typeof dayMetaSchema>

export const DEFAULT_SETTINGS: AppSettings = {
  baseline_rest_kcal: 2150,
  baseline_gym_kcal: 2650,
  deficit_kcal: 550,
  protein_min_g: 120,
  protein_target_g: 140,
  device_kcal_factor: 0.7,
  count_walk_extra: true,
  walk_counts_on_gym_days: false,
  max_alcohol_drinks_per_day: 3,
  goal_loss_kg: 5,
  goal_date: '2026-12-31',
  start_weight_kg: 85,
  height_cm: 170,
  age: 31,
  sex: 'M',
}

export type ParsedEntry = {
  name: string
  quantity: number
  kcal?: number
  proteinG?: number
}

export function parseMealText(_text: string): ParsedEntry[] {
  return []
}

export const backupSchema = z.object({
  foods: z.array(foodSchema),
  entries: z.array(entrySchema),
  activities: z.array(activitySchema),
  weighIns: z.array(weighInSchema),
  days: z.array(dayMetaSchema),
  settings: appSettingsSchema,
})
