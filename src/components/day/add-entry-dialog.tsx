import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
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
import { FoodCombobox } from '@/components/day/food-combobox.tsx'
import { api } from '@/lib/api.ts'
import { queryKeys } from '@/lib/query-keys.ts'
import { MEAL_LABELS, MEAL_TYPES, type MealType } from '@shared/schemas.ts'

type AddEntryDialogProps = {
  date: string
  defaultMeal: MealType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEntryDialog({ date, defaultMeal, open, onOpenChange }: AddEntryDialogProps) {
  const qc = useQueryClient()
  const { data: foods = [] } = useQuery({
    queryKey: queryKeys.foods,
    queryFn: api.getFoods,
    enabled: open,
  })

  const [mealType, setMealType] = useState<MealType>(defaultMeal)
  const [foodId, setFoodId] = useState<string>('manual')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [kcal, setKcal] = useState('')
  const [proteinG, setProteinG] = useState('')

  const mutation = useMutation({
    mutationFn: api.createEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.day(date) })
      toast.success('Comida agregada')
      onOpenChange(false)
      setName('')
      setQuantity('1')
      setKcal('')
      setProteinG('')
      setFoodId('manual')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = Number(quantity)
    if (!Number.isFinite(q) || q <= 0) {
      toast.error('Cantidad inválida')
      return
    }
    if (foodId === 'manual') {
      if (!name.trim()) {
        toast.error('Nombre requerido')
        return
      }
      mutation.mutate({
        date,
        mealType,
        name: name.trim(),
        quantity: q,
        kcal: Number(kcal) || 0,
        proteinG: Number(proteinG) || 0,
      })
      return
    }
    const food = foods.find((f) => String(f.id) === foodId)
    if (!food) return
    mutation.mutate({
      date,
      mealType,
      foodId: food.id,
      name: food.name,
      quantity: q,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (next) setMealType(defaultMeal)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar comida</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Comida</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {MEAL_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Alimento</Label>
            <FoodCombobox foods={foods} value={foodId} onChange={setFoodId} />
          </div>

          {foodId === 'manual' && (
            <div className="space-y-2">
              <Label htmlFor="entry-name">Nombre</Label>
              <Input
                id="entry-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. pollo con arroz"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="entry-kcal">kcal (total)</Label>
                  <Input
                    id="entry-kcal"
                    type="number"
                    inputMode="decimal"
                    value={kcal}
                    onChange={(e) => setKcal(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="entry-protein">Proteína (g)</Label>
                  <Input
                    id="entry-protein"
                    type="number"
                    inputMode="decimal"
                    value={proteinG}
                    onChange={(e) => setProteinG(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="entry-qty">Porciones</Label>
            <Input
              id="entry-qty"
              type="number"
              inputMode="decimal"
              step="0.25"
              min="0.25"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {foodId !== 'manual' && (
              <p className="text-xs text-muted-foreground">
                Se multiplican kcal y proteína del alimento por las porciones.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando…' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
