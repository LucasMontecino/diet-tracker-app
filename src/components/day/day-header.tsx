import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { addDays, formatLocalDate } from '@/lib/calc.ts'
import { TRACKING_START_DATE } from '@/lib/tracking.ts'
import { cn } from '@/lib/utils.ts'

type DayHeaderProps = {
  date: string
  dayType: 'gym' | 'rest'
  onDateChange: (date: string) => void
  className?: string
}

export function DayHeader({ date, dayType, onDateChange, className }: DayHeaderProps) {
  const [open, setOpen] = useState(false)
  const parsed = parseISO(date)
  const label = format(parsed, "EEEE d 'de' MMMM", { locale: es })
  const todayIso = formatLocalDate(new Date())
  const canGoBack = date > TRACKING_START_DATE
  const canGoForward = date < todayIso
  const trackingStart = parseISO(TRACKING_START_DATE)

  return (
    <header className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Día anterior"
          disabled={!canGoBack}
          onClick={() => onDateChange(addDays(date, -1))}
        >
          <ChevronLeft />
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-auto flex-1 flex-col gap-0.5 px-2 py-1"
            >
              <span className="text-base font-semibold capitalize">{label}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="size-3.5" />
                Elegir fecha
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={parsed}
              disabled={{ before: trackingStart, after: new Date() }}
              onSelect={(d) => {
                if (!d) return
                const y = d.getFullYear()
                const m = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                onDateChange(`${y}-${m}-${day}`)
                setOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Día siguiente"
          disabled={!canGoForward}
          onClick={() => onDateChange(addDays(date, 1))}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="flex justify-center">
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            dayType === 'gym'
              ? 'bg-primary/15 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {dayType === 'gym' ? 'Día de gym (CrossFit)' : 'Día de descanso'}
        </span>
      </div>
    </header>
  )
}
