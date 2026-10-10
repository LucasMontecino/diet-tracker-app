import { Card, CardContent } from '@/components/ui/card.tsx'
import { Progress } from '@/components/ui/progress.tsx'
import {
  calorieStatusCopy,
  proteinStatusCopy,
  type DaySummary,
} from '@/lib/calc.ts'
import { statusDotClass, statusTextClass } from '@/lib/status.ts'

function round(n: number) {
  return Math.round(n)
}

type SummaryStripProps = {
  summary: DaySummary
}

export function SummaryStrip({ summary }: SummaryStripProps) {
  const kcalProgress = Math.min(
    100,
    summary.targetKcal > 0 ? (summary.consumedKcal / summary.targetKcal) * 100 : 0,
  )
  const proteinTarget = summary.consumedProtein + summary.remainingProtein
  const proteinProgress =
    proteinTarget > 0
      ? Math.min(100, (summary.consumedProtein / proteinTarget) * 100)
      : 0

  return (
    <section className="space-y-3" aria-label="Resumen del día">
      <div className="grid grid-cols-2 gap-3">
        <Card className="gap-0 py-4">
          <CardContent className="space-y-1 px-4">
            <p className="text-xs text-muted-foreground">Objetivo</p>
            <p className="text-2xl font-semibold tabular-nums">{round(summary.targetKcal)}</p>
            <p className="text-xs text-muted-foreground">kcal · gasto {round(summary.expenditure)}</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-4">
          <CardContent className="space-y-1 px-4">
            <p className="text-xs text-muted-foreground">Consumidas</p>
            <p className="text-2xl font-semibold tabular-nums">{round(summary.consumedKcal)}</p>
            <p className="text-xs text-muted-foreground">
              {summary.remainingKcal >= 0
                ? `Quedan ${round(summary.remainingKcal)}`
                : `${round(-summary.remainingKcal)} de más`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4 py-4">
        <CardContent className="space-y-4 px-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${statusDotClass(summary.calorieStatus)}`}
                  aria-hidden
                />
                Calorías
              </span>
              <span className={statusTextClass(summary.calorieStatus)}>
                {summary.calorieStatus === 'green'
                  ? 'En rango'
                  : summary.calorieStatus === 'amber'
                    ? 'Atención'
                    : summary.calorieStatus === 'red'
                      ? 'Alto'
                      : 'Bajo'}
              </span>
            </div>
            <Progress value={kcalProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">{calorieStatusCopy(summary)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${statusDotClass(summary.proteinStatus)}`}
                  aria-hidden
                />
                Proteína
              </span>
              <span className="tabular-nums">
                {round(summary.consumedProtein)} g · faltan {round(Math.max(0, summary.remainingProtein))}
              </span>
            </div>
            <Progress value={proteinProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">{proteinStatusCopy(summary)}</p>
          </div>

          {(summary.alcoholDrinks > 0 || summary.alcoholWarning) && (
            <p
              className={`text-xs ${summary.alcoholWarning ? 'text-status-red' : 'text-muted-foreground'}`}
            >
              Alcohol: {summary.alcoholDrinks} trago{summary.alcoholDrinks === 1 ? '' : 's'}
              {summary.alcoholWarning ? ' · superaste el límite del día' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
