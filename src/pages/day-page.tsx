import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ActivityPanel } from '@/components/day/activity-panel.tsx'
import { DayHeader } from '@/components/day/day-header.tsx'
import { MealList } from '@/components/day/meal-list.tsx'
import { ContentLoading } from '@/components/loading/content-loading.tsx'
import { SummaryStrip } from '@/components/day/summary-strip.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { api } from '@/lib/api.ts'
import { formatLocalDate } from '@/lib/calc.ts'
import { queryKeys } from '@/lib/query-keys.ts'
import { clampTrackingDate } from '@/lib/tracking.ts'

function todayIso() {
  return formatLocalDate(new Date())
}

export function DayPage() {
  const [params, setParams] = useSearchParams()
  const today = todayIso()
  const rawDate = params.get('date') ?? today
  const date = clampTrackingDate(rawDate, today)
  const qc = useQueryClient()

  useEffect(() => {
    if (rawDate !== date) {
      setParams({ date }, { replace: true })
    }
  }, [rawDate, date, setParams])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.day(date),
    queryFn: () => api.getDay(date),
    placeholderData: (previous) => previous,
  })

  const dayMutation = useMutation({
    mutationFn: (isFreeMeal: boolean) => api.updateDay(date, { isFreeMeal }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.day(date) })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const setDate = (next: string) => {
    setParams({ date: clampTrackingDate(next, today) })
  }

  const waitingForDay = isLoading && !data

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DayHeader
        className="sticky top-0 z-10 -mx-4 mb-0 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        date={date}
        dayType={data?.dayType ?? 'rest'}
        onDateChange={setDate}
      />

      {waitingForDay ? (
        <ContentLoading />
      ) : isError || !data ? (
        <div className="mt-6 rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">No se pudo cargar el día</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {(error as Error)?.message ?? '¿Está corriendo el servidor?'}
          </p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-primary underline"
            onClick={() => refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          <SummaryStrip summary={data} />

          <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="free-meal" className="text-sm font-medium">
                Comida libre
              </Label>
              <p className="text-xs text-muted-foreground">
                No marca alerta roja por exceso de kcal
              </p>
            </div>
            <Switch
              id="free-meal"
              checked={data.dayMeta?.isFreeMeal ?? data.isFreeMeal}
              disabled={dayMutation.isPending}
              onCheckedChange={(checked) => dayMutation.mutate(checked)}
            />
          </div>

          <MealList date={date} entriesByMeal={data.entriesByMeal} />
          <ActivityPanel
            date={date}
            activities={data.activities}
            walkAdjustedKcal={data.walkAdjustedKcal}
          />
        </div>
      )}
    </div>
  )
}
