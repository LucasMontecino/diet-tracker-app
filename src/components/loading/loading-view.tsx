import { cn } from '@/lib/utils.ts'

const LOGO_SRC = '/logo.svg'

type LoadingViewProps = {
  className?: string
  label?: string
  logoSize?: number
}

export function LoadingView({
  className,
  label = 'Diet Tracker',
  logoSize = 120,
}: LoadingViewProps) {
  return (
    <div
      className={cn('flex flex-col items-center gap-4', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <img
        src={LOGO_SRC}
        alt=""
        width={logoSize}
        height={logoSize}
        className="animate-pulse"
        draggable={false}
      />
      <p className="text-base font-semibold tracking-tight text-foreground">{label}</p>
    </div>
  )
}
