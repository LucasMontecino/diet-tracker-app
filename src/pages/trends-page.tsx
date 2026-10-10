import { useQuery } from '@tanstack/react-query'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ContentLoading } from '@/components/loading/content-loading.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { api } from '@/lib/api.ts'
import { addDays, formatLocalDate } from '@/lib/calc.ts'
import { queryKeys } from '@/lib/query-keys.ts'

export function TrendsPage() {
  const to = formatLocalDate(new Date())
  const from = addDays(to, -13)

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.trends(from, to),
    queryFn: () => api.getTrends(from, to),
  })

  if (isLoading) {
    return <ContentLoading />
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        No se pudieron cargar las tendencias. Verificá que la API esté activa.
      </p>
    )
  }

  const chartData = data.series.map((d) => ({
    date: d.date.slice(5),
    consumidas: Math.round(d.consumedKcal),
    objetivo: Math.round(d.targetKcal),
    peso: d.weight,
    peso7: d.weightAvg7 != null ? Math.round(d.weightAvg7 * 10) / 10 : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tendencias</h1>
        <p className="text-sm text-muted-foreground">Últimos 14 días</p>
      </div>

      {data.suggestions.length > 0 && (
        <Card className="gap-2 border-primary/20 bg-primary/5 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">Sugerencias</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {data.suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="gap-2 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">Calorías</CardTitle>
        </CardHeader>
        <CardContent className="h-56 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={36} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="objetivo"
                name="Objetivo"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="consumidas"
                name="Consumidas"
                stroke="var(--status-amber)"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="gap-2 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">Peso</CardTitle>
        </CardHeader>
        <CardContent className="h-48 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} width={36} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="peso"
                name="Peso"
                stroke="var(--foreground)"
                strokeWidth={2}
                connectNulls
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="peso7"
                name="Media 7d"
                stroke="var(--status-green)"
                strokeWidth={2}
                connectNulls
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
