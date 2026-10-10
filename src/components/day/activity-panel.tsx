import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dumbbell, Footprints, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { api } from '@/lib/api.ts'
import { queryKeys } from '@/lib/query-keys.ts'
import {
  ACTIVITY_LABELS,
  ACTIVITY_TYPES,
  type Activity,
  type ActivityType,
} from '@shared/schemas.ts'

type ActivityPanelProps = {
  date: string
  activities: Activity[]
  walkAdjustedKcal: number
}

const iconFor: Record<ActivityType, typeof Footprints> = {
  walk: Footprints,
  crossfit: Dumbbell,
  other: Footprints,
}

export function ActivityPanel({ date, activities, walkAdjustedKcal }: ActivityPanelProps) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ActivityType>('walk')
  const [durationMin, setDurationMin] = useState('30')
  const [deviceKcal, setDeviceKcal] = useState('')
  const [steps, setSteps] = useState('')

  const createMutation = useMutation({
    mutationFn: api.createActivity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.day(date) })
      toast.success('Actividad registrada')
      setOpen(false)
      setDurationMin('30')
      setDeviceKcal('')
      setSteps('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteActivity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.day(date) })
      toast.success('Actividad eliminada')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <section className="space-y-3" aria-label="Actividad">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Actividad
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Registrar
        </Button>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Caminata extra (ajustada)
          </CardTitle>
          <p className="text-lg font-semibold tabular-nums">{Math.round(walkAdjustedKcal)} kcal</p>
        </CardHeader>
        <CardContent className="px-4 py-2">
          {activities.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">Sin actividades</p>
          ) : (
            <ul className="divide-y">
              {activities.map((a) => {
                const Icon = iconFor[a.type]
                return (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex min-w-0 items-start gap-2">
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{ACTIVITY_LABELS[a.type]}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {a.durationMin} min
                          {a.deviceKcal != null ? ` · ${Math.round(a.deviceKcal)} kcal reloj` : ''}
                          {a.steps != null ? ` · ${a.steps} pasos` : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Eliminar actividad"
                      onClick={() => deleteMutation.mutate(a.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva actividad</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const dur = Number(durationMin)
              if (!Number.isFinite(dur) || dur < 0) {
                toast.error('Duración inválida')
                return
              }
              createMutation.mutate({
                date,
                type,
                durationMin: dur,
                deviceKcal: deviceKcal ? Number(deviceKcal) : null,
                steps: steps ? Number(steps) : null,
              })
            }}
          >
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {ACTIVITY_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-dur">Duración (min)</Label>
              <Input
                id="act-dur"
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="act-kcal">kcal reloj</Label>
                <Input
                  id="act-kcal"
                  type="number"
                  value={deviceKcal}
                  onChange={(e) => setDeviceKcal(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="act-steps">Pasos</Label>
                <Input
                  id="act-steps"
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
