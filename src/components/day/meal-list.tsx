import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AddEntryDialog } from '@/components/day/add-entry-dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { api, type DayDetail } from '@/lib/api.ts'
import { queryKeys } from '@/lib/query-keys.ts'
import { MEAL_LABELS, MEAL_TYPES, type Entry, type MealType } from '@shared/schemas.ts'

type MealListProps = {
  date: string
  entriesByMeal: DayDetail['entriesByMeal']
}

function mealTotals(entries: Entry[]) {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.proteinG,
    }),
    { kcal: 0, protein: 0 },
  )
}

export function MealList({ date, entriesByMeal }: MealListProps) {
  const qc = useQueryClient()
  const [dialogMeal, setDialogMeal] = useState<MealType | null>(null)

  const deleteMutation = useMutation({
    mutationFn: api.deleteEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.day(date) })
      toast.success('Entrada eliminada')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <section className="space-y-3" aria-label="Comidas">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Diario
      </h2>

      {MEAL_TYPES.map((meal) => {
        const entries = entriesByMeal[meal] ?? []
        const totals = mealTotals(entries)
        return (
          <Card key={meal} className="gap-0 py-0">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-3">
              <div>
                <CardTitle className="text-base">{MEAL_LABELS[meal]}</CardTitle>
                {entries.length > 0 && (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {Math.round(totals.kcal)} kcal · {Math.round(totals.protein)} g prot.
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogMeal(meal)}
              >
                <Plus className="size-4" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent className="px-4 py-2">
              {entries.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">Sin entradas</p>
              ) : (
                <ul className="divide-y">
                  {entries.map((entry) => (
                    <li key={entry.id} className="flex items-start justify-between gap-2 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{entry.name}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {entry.quantity}× · {Math.round(entry.kcal)} kcal ·{' '}
                          {Math.round(entry.proteinG)} g
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Eliminar ${entry.name}`}
                        onClick={() => deleteMutation.mutate(entry.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )
      })}

      {dialogMeal && (
        <AddEntryDialog
          date={date}
          defaultMeal={dialogMeal}
          open={dialogMeal !== null}
          onOpenChange={(open) => {
            if (!open) setDialogMeal(null)
          }}
        />
      )}
    </section>
  )
}
