import { LoadingView } from '@/components/loading/loading-view.tsx'

/** Centra el loading en el área principal (entre header y nav). */
export function ContentLoading() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center py-8">
      <LoadingView />
    </div>
  )
}
