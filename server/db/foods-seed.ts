export type FoodSeed = {
  name: string
  servingLabel: string
  kcal: number
  proteinG: number
  alcoholMl?: number | null
  favorite?: boolean
}

const favoriteNames = new Set(
  [
    'Huevo',
    'Atún al natural',
    'Banana',
    'Yogur casero',
    'Granola',
    'Miel',
    'Queso cremoso (fetita chica)',
    'Jamón cocido',
    'Colita de cuadril',
    'Mate amargo',
  ].map((n) => n.toLowerCase()),
)

export const FOOD_SEED: FoodSeed[] = [
  { name: 'Huevo', servingLabel: '1 unidad', kcal: 70, proteinG: 6 },
  { name: 'Atún al natural', servingLabel: '1 lata (~120 g escurrido)', kcal: 130, proteinG: 26 },
  { name: 'Jamón cocido', servingLabel: '1 feta', kcal: 22, proteinG: 4 },
  { name: 'Queso barra', servingLabel: '1 feta', kcal: 45, proteinG: 3 },
  { name: 'Queso cremoso', servingLabel: '1 feta', kcal: 43, proteinG: 1 },
  { name: 'Queso cremoso (fetita chica)', servingLabel: '1 unidad', kcal: 22, proteinG: 0.5 },
  { name: 'Colita de cuadril', servingLabel: '1 feta (~100 g)', kcal: 140, proteinG: 21 },
  { name: 'Milanesa de pollo al horno', servingLabel: '1 unidad (~150 g)', kcal: 220, proteinG: 35 },
  { name: 'Suprema de pollo', servingLabel: '200 g', kcal: 220, proteinG: 42 },
  { name: 'Hamburguesa casera', servingLabel: '1 unidad', kcal: 250, proteinG: 22 },
  { name: 'Medallón de merluza', servingLabel: '1 unidad', kcal: 180, proteinG: 20 },
  { name: 'Bocadito de pollo (frito)', servingLabel: '1 unidad', kcal: 62, proteinG: 5 },
  { name: 'Bocadito de carne', servingLabel: '1 unidad', kcal: 60, proteinG: 6 },
  { name: 'Banana', servingLabel: '1 mediana', kcal: 105, proteinG: 1 },
  { name: 'Manzana', servingLabel: '1 pequeña', kcal: 60, proteinG: 0 },
  { name: 'Pera', servingLabel: '1 unidad', kcal: 100, proteinG: 0.5 },
  { name: 'Frutillas', servingLabel: '1 unidad', kcal: 2.4, proteinG: 0 },
  { name: 'Nuez', servingLabel: '1 unidad entera', kcal: 30, proteinG: 0.7 },
  { name: 'Nuez mariposa', servingLabel: '1 unidad', kcal: 13, proteinG: 0.3 },
  { name: 'Maní salado', servingLabel: '1 cucharada', kcal: 58, proteinG: 2.3 },
  { name: 'Yogur casero', servingLabel: '1 cucharada', kcal: 13, proteinG: 1 },
  { name: 'Granola', servingLabel: '1 cucharada', kcal: 43, proteinG: 1 },
  { name: 'Avena', servingLabel: '1 puñado (15 g)', kcal: 55, proteinG: 2 },
  { name: 'Miel', servingLabel: '1 cucharadita', kcal: 20, proteinG: 0 },
  { name: 'Chipa', servingLabel: '1 unidad', kcal: 75, proteinG: 2 },
  { name: 'Empanada de cebolla y queso', servingLabel: '1 unidad', kcal: 180, proteinG: 5 },
  { name: 'Tarta de cebolla y queso', servingLabel: '1 porción (1/8)', kcal: 165, proteinG: 5 },
  { name: 'Tarta de jamón y queso', servingLabel: '1/4 de tarta', kcal: 350, proteinG: 14 },
  { name: 'Sopa paraguaya', servingLabel: '1 porción mediana', kcal: 325, proteinG: 13 },
  { name: 'Puré de papa', servingLabel: '1 cucharada', kcal: 30, proteinG: 0.7 },
  { name: 'Ñoquis con bolognesa', servingLabel: '1 cucharada', kcal: 60, proteinG: 2.5 },
  { name: 'Arvejas', servingLabel: '1 porción (~100 g)', kcal: 80, proteinG: 5 },
  { name: 'Arroz cocido', servingLabel: '1 porción chica', kcal: 150, proteinG: 3 },
  { name: 'Papas y cebollas al horno', servingLabel: '1 porción moderada', kcal: 200, proteinG: 4 },
  { name: 'Ensalada de lechuga y tomate', servingLabel: '1 plato', kcal: 15, proteinG: 0 },
  { name: 'Ensalada con choclo', servingLabel: '1 plato', kcal: 45, proteinG: 1 },
  { name: 'Mandioca frita', servingLabel: '1 porción', kcal: 350, proteinG: 3 },
  { name: 'Sándwich de vacío', servingLabel: '1 unidad', kcal: 650, proteinG: 35 },
  { name: 'Café con chorrito de leche', servingLabel: '1 taza', kcal: 20, proteinG: 1 },
  { name: 'Mate amargo', servingLabel: '1 mate', kcal: 0, proteinG: 0 },
  { name: 'Cerveza 330 ml', servingLabel: '1 unidad', kcal: 140, proteinG: 0, alcoholMl: 330 },
  { name: 'Cerveza 355 ml', servingLabel: '1 unidad', kcal: 150, proteinG: 0, alcoholMl: 355 },
  { name: 'Cerveza 600 ml', servingLabel: '1 unidad', kcal: 255, proteinG: 0, alcoholMl: 600 },
  { name: 'Cerveza 0.0 330 ml', servingLabel: '1 unidad', kcal: 70, proteinG: 0 },
].map((food) => ({
  ...food,
  favorite: favoriteNames.has(food.name.toLowerCase()),
}))
