import type {
  Activity,
  ActivityType,
  AppSettings,
  DayMeta,
  Entry,
  Food,
  MealType,
  WeighIn,
} from '@shared/schemas.ts'
import type { DaySummary } from '@/lib/calc.ts'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(body?.error ?? res.statusText, res.status)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export type DayDetail = DaySummary & {
  settings: AppSettings
  entries: Entry[]
  entriesByMeal: Record<MealType, Entry[]>
  activities: Activity[]
  dayMeta: DayMeta | null
}

export type TrendsResponse = {
  series: (DaySummary & {
    steps: number
    weight: number | null
    weightAvg7: number | null
  })[]
  suggestions: string[]
  settings: AppSettings
}

export const api = {
  getDay: (date: string) => request<DayDetail>(`/days/${date}`),
  updateDay: (date: string, body: Partial<DayMeta>) =>
    request<DayMeta>(`/days/${date}`, { method: 'PUT', body: JSON.stringify(body) }),

  getFoods: () => request<Food[]>('/foods'),
  createEntry: (body: {
    date: string
    mealType: MealType
    foodId?: number | null
    name: string
    quantity: number
    kcal?: number
    proteinG?: number
  }) => request<Entry>('/entries', { method: 'POST', body: JSON.stringify(body) }),
  deleteEntry: (id: number) => request<{ ok: true }>(`/entries/${id}`, { method: 'DELETE' }),

  createActivity: (body: {
    date: string
    type: ActivityType
    durationMin: number
    deviceKcal?: number | null
    steps?: number | null
  }) => request<Activity>('/activities', { method: 'POST', body: JSON.stringify(body) }),
  deleteActivity: (id: number) =>
    request<{ ok: true }>(`/activities/${id}`, { method: 'DELETE' }),

  getSettings: () => request<AppSettings>('/settings'),
  getTrends: (from: string, to: string) =>
    request<TrendsResponse>(`/trends?from=${from}&to=${to}`),

  getWeights: () => request<WeighIn[]>('/weights'),
}
