import { useQuery } from '@tanstack/react-query'
import { CalendarDays, LineChart, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { ContentLoading } from '@/components/loading/content-loading.tsx'
import { api } from '@/lib/api.ts'
import { cn } from '@/lib/utils.ts'

const nav = [
  { to: '/', label: 'Día', icon: CalendarDays, end: true },
  { to: '/trends', label: 'Tendencias', icon: LineChart, end: false },
  { to: '/settings', label: 'Ajustes', icon: Settings, end: false },
] as const

function useAppBoot() {
  return useQuery({
    queryKey: ['app', 'boot'],
    queryFn: async () => {
      await Promise.all([api.getSettings(), api.getFoods()])
      return true
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  })
}

export function AppShell() {
  const boot = useAppBoot()

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col">
      <main className="min-h-0 flex-1">
        <div className="h-full min-h-0 overflow-y-auto overscroll-y-contain">
          <div className="flex min-h-full flex-col px-4 pb-[calc(4.25rem+1.5rem)]">
            {boot.isLoading ? (
              <ContentLoading />
            ) : boot.isError ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-2 pt-4 text-center text-sm">
                <p className="font-medium">No se pudo conectar con el servidor</p>
                <p className="text-muted-foreground">
                  Ejecutá <code className="text-xs">npm run dev</code> para levantar la API.
                </p>
                <button
                  type="button"
                  className="mt-2 text-primary underline"
                  onClick={() => boot.refetch()}
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
        aria-label="Principal"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <item.icon className="size-5" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
