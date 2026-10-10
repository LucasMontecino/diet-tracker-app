import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '../../shared/schemas.ts'
import {
  alcoholDrinks,
  autoSuggestions,
  calorieStatus,
  dayType,
  expenditure,
  movingAverage7,
  proteinStatus,
  summarizeDay,
  walkAdjustedKcal,
  weeklyAverages,
} from './calc.ts'

const settings = { ...DEFAULT_SETTINGS }

describe('dayType', () => {
  it('es gym si hay CrossFit', () => {
    expect(dayType([{ type: 'walk' }, { type: 'crossfit' }])).toBe('gym')
  })
  it('es rest si no hay CrossFit', () => {
    expect(dayType([{ type: 'walk' }])).toBe('rest')
  })
})

describe('walkAdjustedKcal', () => {
  it('aplica el factor del reloj', () => {
    expect(
      walkAdjustedKcal(
        [
          { type: 'walk', deviceKcal: 400 },
          { type: 'crossfit', deviceKcal: 500 },
        ],
        0.7,
      ),
    ).toBeCloseTo(280)
  })
})

describe('expenditure', () => {
  it('usa override si existe', () => {
    expect(
      expenditure({
        settings,
        activities: [{ type: 'crossfit', deviceKcal: 400 }],
        overrideKcal: 3000,
      }),
    ).toBe(3000)
  })

  it('usa baseline de gym y no suma caminata por default', () => {
    expect(
      expenditure({
        settings,
        activities: [
          { type: 'crossfit', deviceKcal: 400 },
          { type: 'walk', deviceKcal: 400 },
        ],
        overrideKcal: null,
      }),
    ).toBe(2650)
  })

  it('suma caminata ajustada en día de descanso', () => {
    expect(
      expenditure({
        settings,
        activities: [{ type: 'walk', deviceKcal: 400 }],
        overrideKcal: null,
      }),
    ).toBeCloseTo(2150 + 280)
  })
})

describe('calorie and protein status', () => {
  it('verde cerca del objetivo', () => {
    expect(
      calorieStatus({ consumed: 2100, target: 2100, balance: 550, isFreeMeal: false }),
    ).toBe('green')
  })

  it('ámbar si se pasa un poco', () => {
    expect(
      calorieStatus({ consumed: 2250, target: 2100, balance: 400, isFreeMeal: false }),
    ).toBe('amber')
  })

  it('rojo si se pasa más de 400', () => {
    expect(
      calorieStatus({ consumed: 2600, target: 2100, balance: 50, isFreeMeal: false }),
    ).toBe('red')
  })

  it('no dispara rojo en comida libre', () => {
    expect(
      calorieStatus({ consumed: 2600, target: 2100, balance: 50, isFreeMeal: true }),
    ).toBe('amber')
  })

  it('ámbar si el déficit real supera 1000', () => {
    expect(
      calorieStatus({ consumed: 1000, target: 2100, balance: 1650, isFreeMeal: false }),
    ).toBe('amber')
  })

  it('proteína verde / ámbar / rojo', () => {
    expect(proteinStatus(120, 120)).toBe('green')
    expect(proteinStatus(100, 120)).toBe('amber')
    expect(proteinStatus(80, 120)).toBe('red')
  })

  it('cuenta bebidas con alcohol_ml > 0', () => {
    expect(
      alcoholDrinks([{ alcoholMl: 330 }, { alcoholMl: 0 }, { alcoholMl: null }]),
    ).toBe(1)
  })
})

describe('summarizeDay', () => {
  it('arma el resumen de un día gym', () => {
    const summary = summarizeDay({
      date: '2026-10-10',
      settings,
      entries: [
        {
          id: 1,
          date: '2026-10-10',
          mealType: 'desayuno',
          foodId: 1,
          name: 'Huevo',
          quantity: 2,
          kcal: 140,
          proteinG: 12,
          alcoholMl: null,
          note: null,
          createdAt: '',
        },
      ],
      activities: [
        {
          id: 1,
          date: '2026-10-10',
          type: 'crossfit',
          durationMin: 60,
          steps: null,
          distanceKm: null,
          deviceKcal: 500,
          note: null,
        },
      ],
      dayMeta: null,
    })
    expect(summary.dayType).toBe('gym')
    expect(summary.expenditure).toBe(2650)
    expect(summary.targetKcal).toBe(2100)
    expect(summary.consumedKcal).toBe(140)
    expect(summary.remainingKcal).toBe(1960)
  })
})

describe('weight averages', () => {
  const weighIns = [
    { date: '2026-09-28', kg: 86 },
    { date: '2026-09-29', kg: 85.8 },
    { date: '2026-09-30', kg: 85.7 },
    { date: '2026-10-01', kg: 85.6 },
    { date: '2026-10-02', kg: 85.5 },
    { date: '2026-10-03', kg: 85.4 },
    { date: '2026-10-04', kg: 85.3 },
    { date: '2026-10-05', kg: 85.2 },
    { date: '2026-10-06', kg: 85.1 },
    { date: '2026-10-07', kg: 85.0 },
    { date: '2026-10-08', kg: 84.9 },
    { date: '2026-10-09', kg: 84.8 },
    { date: '2026-10-10', kg: 84.7 },
  ]

  it('promedio móvil de 7 días', () => {
    const expected = (85.3 + 85.2 + 85.1 + 85.0 + 84.9 + 84.8 + 84.7) / 7
    expect(movingAverage7(weighIns, '2026-10-10')).toBeCloseTo(expected)
  })

  it('cambio semanal', () => {
    const { weeklyChange } = weeklyAverages(weighIns, '2026-10-10')
    expect(weeklyChange).not.toBeNull()
    expect(weeklyChange!).toBeLessThan(0)
  })
})

describe('autoSuggestions', () => {
  it('avisa si hay dos días seguidos con déficit > 1000', () => {
    const tips = autoSuggestions({
      weighIns: [],
      dailyBalances: [
        { date: '2026-10-09', balance: 1100 },
        { date: '2026-10-10', balance: 1200 },
      ],
      endDate: '2026-10-10',
    })
    expect(tips.some((t) => t.includes('Evitá compensar'))).toBe(true)
  })

  it('avisa si baja más de 0.8 kg/semana', () => {
    const weighIns = [
      { date: '2026-09-28', kg: 86 },
      { date: '2026-09-29', kg: 86 },
      { date: '2026-09-30', kg: 86 },
      { date: '2026-10-01', kg: 86 },
      { date: '2026-10-02', kg: 86 },
      { date: '2026-10-03', kg: 86 },
      { date: '2026-10-04', kg: 86 },
      { date: '2026-10-05', kg: 85 },
      { date: '2026-10-06', kg: 85 },
      { date: '2026-10-07', kg: 85 },
      { date: '2026-10-08', kg: 85 },
      { date: '2026-10-09', kg: 85 },
      { date: '2026-10-10', kg: 85 },
    ]
    const tips = autoSuggestions({
      weighIns,
      dailyBalances: [],
      endDate: '2026-10-10',
    })
    expect(tips.some((t) => t.includes('bajando rápido'))).toBe(true)
  })
})
