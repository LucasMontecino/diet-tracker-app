/** Primer día con registros importados / inicio del seguimiento. */
export const TRACKING_START_DATE = '2026-09-28'

export function clampTrackingDate(iso: string, todayIso: string): string {
  if (iso < TRACKING_START_DATE) return TRACKING_START_DATE
  if (iso > todayIso) return todayIso
  return iso
}
