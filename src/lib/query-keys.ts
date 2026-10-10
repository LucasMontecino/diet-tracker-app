export const queryKeys = {
  day: (date: string) => ['day', date] as const,
  foods: ['foods'] as const,
  settings: ['settings'] as const,
  trends: (from: string, to: string) => ['trends', from, to] as const,
}
