import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { commandSearchFilter } from '@/lib/search.ts'
import { cn } from '@/lib/utils.ts'
import type { Food } from '@shared/schemas.ts'

type FoodComboboxProps = {
  foods: Food[]
  value: string
  onChange: (value: string) => void
}

function foodSearchValue(food: Food) {
  return `${food.name} ${food.servingLabel} ${food.kcal} kcal`
}

export function FoodCombobox({ foods, value, onChange }: FoodComboboxProps) {
  const [open, setOpen] = useState(false)

  const favorites = useMemo(() => foods.filter((f) => f.isFavorite), [foods])
  const rest = useMemo(() => foods.filter((f) => !f.isFavorite), [foods])

  const selected = value === 'manual' ? null : foods.find((f) => String(f.id) === value)

  const label =
    value === 'manual'
      ? 'Entrada manual'
      : selected
        ? `${selected.name} · ${selected.kcal} kcal`
        : 'Elegir alimento'

  const pick = (next: string) => {
    onChange(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between font-normal"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command filter={commandSearchFilter}>
          <CommandInput placeholder="Buscar alimento…" />
          <CommandList className="max-h-56">
            <CommandEmpty>No hay alimentos con ese nombre.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="entrada manual" onSelect={() => pick('manual')}>
                <CheckIcon
                  className={cn('size-4', value === 'manual' ? 'opacity-100' : 'opacity-0')}
                />
                Entrada manual
              </CommandItem>
            </CommandGroup>
            {favorites.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Favoritos">
                  {favorites.map((food) => (
                    <CommandItem
                      key={food.id}
                      value={foodSearchValue(food)}
                      onSelect={() => pick(String(food.id))}
                    >
                      <CheckIcon
                        className={cn(
                          'size-4',
                          value === String(food.id) ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="truncate">
                        {food.name} · {food.kcal} kcal / {food.servingLabel}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {rest.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Catálogo">
                  {rest.map((food) => (
                    <CommandItem
                      key={food.id}
                      value={foodSearchValue(food)}
                      onSelect={() => pick(String(food.id))}
                    >
                      <CheckIcon
                        className={cn(
                          'size-4',
                          value === String(food.id) ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="truncate">
                        {food.name} · {food.kcal} kcal
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
