import type { CalorieStatus, ProteinStatus } from '@/lib/calc.ts'

export function statusDotClass(status: CalorieStatus | ProteinStatus | 'neutral'): string {
  switch (status) {
    case 'green':
      return 'bg-status-green'
    case 'amber':
      return 'bg-status-amber'
    case 'red':
      return 'bg-status-red'
    default:
      return 'bg-muted-foreground/40'
  }
}

export function statusTextClass(status: CalorieStatus | ProteinStatus | 'neutral'): string {
  switch (status) {
    case 'green':
      return 'text-[color:var(--status-green)]'
    case 'amber':
      return 'text-[color:var(--status-amber)]'
    case 'red':
      return 'text-[color:var(--status-red)]'
    default:
      return 'text-muted-foreground'
  }
}
