import { useQuery } from '@tanstack/react-query'
import { ContentLoading } from '@/components/loading/content-loading.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { api } from '@/lib/api.ts'
import { queryKeys } from '@/lib/query-keys.ts'

const labels: Record<string, string> = {
  baseline_rest_kcal: 'Gasto base (descanso)',
  baseline_gym_kcal: 'Gasto base (gym)',
  deficit_kcal: 'Déficit objetivo',
  protein_min_g: 'Proteína mínima',
  protein_target_g: 'Proteína objetivo',
  device_kcal_factor: 'Factor kcal reloj (caminata)',
  count_walk_extra: 'Sumar caminata extra',
  walk_counts_on_gym_days: 'Caminata en días de gym',
  max_alcohol_drinks_per_day: 'Máx. tragos / día',
  goal_loss_kg: 'Meta de baja (kg)',
  goal_date: 'Fecha meta',
  start_weight_kg: 'Peso inicial',
  height_cm: 'Altura (cm)',
  age: 'Edad',
  sex: 'Sexo',
}

export function SettingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: api.getSettings,
  })

  if (isLoading) {
    return <ContentLoading />
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">No se pudieron cargar los ajustes.</p>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      <div>
        <h1 className="text-xl font-semibold">Ajustes</h1>
        <p className="text-sm text-muted-foreground">
          Valores que usa el cálculo del día. Edición en una próxima iteración.
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-base">Plan</CardTitle>
        </CardHeader>
        <CardContent className="divide-y px-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-muted-foreground">{labels[key] ?? key}</span>
              <span className="font-medium tabular-nums">
                {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
