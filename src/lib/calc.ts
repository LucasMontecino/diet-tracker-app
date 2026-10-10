import type { Activity, AppSettings, DayMeta, Entry, WeighIn } from '../../shared/schemas.ts'

export type CalorieStatus = 'green' | 'amber' | 'red' | 'neutral'
export type ProteinStatus = 'green' | 'amber' | 'red'
export type DayType = 'gym' | 'rest'

export function dayType(activities: Pick<Activity, 'type'>[]): DayType {
  return activities.some((a) => a.type === 'crossfit') ? 'gym' : 'rest'
}

export function walkAdjustedKcal(
  activities: Pick<Activity, 'type' | 'deviceKcal'>[],
  factor: number,
): number {
  const walkDevice = activities
    .filter((a) => a.type === 'walk')
    .reduce((sum, a) => sum + (a.deviceKcal ?? 0), 0)
  return walkDevice * factor
}

export function expenditure(args: {
  settings: AppSettings
  activities: Pick<Activity, 'type' | 'deviceKcal'>[]
  overrideKcal: number | null | undefined
}): number {
  if (args.overrideKcal != null) return args.overrideKcal
  const type = dayType(args.activities)
  const baseline =
    type === 'gym' ? args.settings.baseline_gym_kcal : args.settings.baseline_rest_kcal
  const includeWalk =
    args.settings.count_walk_extra &&
    (type === 'rest' || args.settings.walk_counts_on_gym_days)
  const extra = includeWalk
    ? walkAdjustedKcal(args.activities, args.settings.device_kcal_factor)
    : 0
  return baseline + extra
}

export function calorieStatus(args: {
  consumed: number
  target: number
  balance: number
  isFreeMeal: boolean
}): CalorieStatus {
  const { consumed, target, balance, isFreeMeal } = args
  if (consumed > target + 400) return isFreeMeal ? 'amber' : 'red'
  if (consumed > target + 100) return 'amber'
  if (balance > 1000) return 'amber'
  if (consumed >= target - 250 && consumed <= target + 100) return 'green'
  return 'neutral'
}

export function proteinStatus(consumed: number, proteinMinG: number): ProteinStatus {
  if (consumed >= proteinMinG) return 'green'
  if (consumed >= 90) return 'amber'
  return 'red'
}

export function alcoholDrinks(entries: Pick<Entry, 'alcoholMl'>[]): number {
  return entries.filter((e) => (e.alcoholMl ?? 0) > 0).length
}

export type DaySummary = {
  date: string
  dayType: DayType
  expenditure: number
  targetKcal: number
  consumedKcal: number
  consumedProtein: number
  remainingKcal: number
  remainingProtein: number
  balance: number
  calorieStatus: CalorieStatus
  proteinStatus: ProteinStatus
  alcoholDrinks: number
  alcoholWarning: boolean
  isFreeMeal: boolean
  walkAdjustedKcal: number
  largeDeficit: boolean
}

export function summarizeDay(args: {
  date: string
  settings: AppSettings
  entries: Entry[]
  activities: Activity[]
  dayMeta: DayMeta | null
}): DaySummary {
  const { date, settings, entries, activities, dayMeta } = args
  const type = dayType(activities)
  const walkAdj = walkAdjustedKcal(activities, settings.device_kcal_factor)
  const exp = expenditure({
    settings,
    activities,
    overrideKcal: dayMeta?.expenditureOverrideKcal,
  })
  const targetKcal = exp - settings.deficit_kcal
  const consumedKcal = entries.reduce((s, e) => s + e.kcal, 0)
  const consumedProtein = entries.reduce((s, e) => s + e.proteinG, 0)
  const remainingKcal = targetKcal - consumedKcal
  const remainingProtein = settings.protein_target_g - consumedProtein
  const balance = exp - consumedKcal
  const isFreeMeal = dayMeta?.isFreeMeal ?? false
  const drinks = alcoholDrinks(entries)
  return {
    date,
    dayType: type,
    expenditure: exp,
    targetKcal,
    consumedKcal,
    consumedProtein,
    remainingKcal,
    remainingProtein,
    balance,
    calorieStatus: calorieStatus({
      consumed: consumedKcal,
      target: targetKcal,
      balance,
      isFreeMeal,
    }),
    proteinStatus: proteinStatus(consumedProtein, settings.protein_min_g),
    alcoholDrinks: drinks,
    alcoholWarning: drinks > settings.max_alcohol_drinks_per_day,
    isFreeMeal,
    walkAdjustedKcal: walkAdj,
    largeDeficit: balance > 1000,
  }
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return formatLocalDate(dt)
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function movingAverage7(
  weighIns: Pick<WeighIn, 'date' | 'kg'>[],
  date: string,
): number | null {
  const start = addDays(date, -6)
  const window = weighIns.filter((w) => w.date >= start && w.date <= date)
  if (window.length === 0) return null
  return window.reduce((s, w) => s + w.kg, 0) / window.length
}

export function weeklyAverages(weighIns: Pick<WeighIn, 'date' | 'kg'>[], endDate: string) {
  const thisWeekDates = Array.from({ length: 7 }, (_, i) => addDays(endDate, -6 + i))
  const prevWeekDates = Array.from({ length: 7 }, (_, i) => addDays(endDate, -13 + i))
  const avg = (dates: string[]) => {
    const pts = weighIns.filter((w) => dates.includes(w.date))
    if (pts.length === 0) return null
    return pts.reduce((s, w) => s + w.kg, 0) / pts.length
  }
  const current = avg(thisWeekDates)
  const previous = avg(prevWeekDates)
  const weeklyChange =
    current != null && previous != null ? current - previous : null
  return { current, previous, weeklyChange }
}

export function autoSuggestions(args: {
  weighIns: Pick<WeighIn, 'date' | 'kg'>[]
  dailyBalances: { date: string; balance: number }[]
  endDate: string
}): string[] {
  const tips: string[] = []
  const week1End = args.endDate
  const week2End = addDays(args.endDate, -7)
  const week3End = addDays(args.endDate, -14)
  const w1 = weeklyAverages(args.weighIns, week1End).weeklyChange
  const w2 = weeklyAverages(args.weighIns, week2End).weeklyChange
  const w3 = weeklyAverages(args.weighIns, week3End).weeklyChange

  if (w1 != null && w1 < -0.8) {
    tips.push('Estás bajando rápido; sumá una colación o subí porciones')
  }
  if (
    w1 != null &&
    w2 != null &&
    w1 > -0.3 &&
    w2 > -0.3 &&
    w1 < 0.3 &&
    w2 < 0.3
  ) {
    // "baja menos de 0.3 kg/semana durante 2 semanas seguidas"
    // weeklyChange is current - previous; loss means negative change.
    // If loss < 0.3 kg/week, weeklyChange > -0.3 (including plateaus/gains)
  }

  const slow1 = w1 != null && w1 > -0.3
  const slow2 = w2 != null && w2 > -0.3
  if (slow1 && slow2 && w1 != null && w2 != null) {
    tips.push(
      'Probá recortar ~150 kcal (por ejemplo 30-40 g de carbo en la cena)',
    )
  }

  // unused on purpose if we only need 2 weeks; keep w3 available for future
  void w3

  const sorted = [...args.dailyBalances].sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].balance > 1000 && sorted[i].balance > 1000) {
      tips.push('Evitá compensar de menos; volvé al plan normal')
      break
    }
  }

  return tips
}

export function calorieStatusCopy(summary: DaySummary): string {
  if (summary.isFreeMeal) return 'Comida libre: no cuenta como alerta roja.'
  if (summary.calorieStatus === 'red') return 'Te pasaste bastante del objetivo de kcal.'
  if (summary.largeDeficit)
    return 'Déficit muy grande, no conviene sostenerlo.'
  if (summary.calorieStatus === 'amber') return 'Un poco fuera del rango objetivo de kcal.'
  if (summary.calorieStatus === 'green') return 'Calorías dentro del rango objetivo.'
  return 'Calorías por debajo del rango verde, pero el déficit no es extremo.'
}

export function proteinStatusCopy(summary: DaySummary): string {
  if (summary.proteinStatus === 'green') return 'Proteína en el piso o por encima.'
  if (summary.proteinStatus === 'amber') return 'Proteína justa: tratá de acercarte al piso.'
  return 'Proteína baja: priorizá una porción extra.'
}
