import { ShoppingBasket, Ruler, Thermometer, Soup, Egg, CookingPot, Drumstick, Cake, Microscope, ClipboardList, type LucideIcon } from 'lucide-react';
export interface Food2Theme { key: string; accent: string; accent2: string; Icon: LucideIcon }
export const FOOD2_THEMES: Record<string, Food2Theme> = {
  market:    { key: 'market',    accent: '#16a34a', accent2: '#84cc16', Icon: ShoppingBasket },
  precision: { key: 'precision', accent: '#0d9488', accent2: '#22c55e', Icon: Ruler },
  heatlab:   { key: 'heatlab',   accent: '#dc2626', accent2: '#f97316', Icon: Thermometer },
  sauce:     { key: 'sauce',     accent: '#b45309', accent2: '#f59e0b', Icon: Soup },
  egg:       { key: 'egg',       accent: '#ca8a04', accent2: '#fde047', Icon: Egg },
  world:     { key: 'world',     accent: '#ea580c', accent2: '#e11d48', Icon: CookingPot },
  butchery:  { key: 'butchery',  accent: '#9f1239', accent2: '#fb7185', Icon: Drumstick },
  pastry:    { key: 'pastry',    accent: '#c2410c', accent2: '#fbbf24', Icon: Cake },
  quality:   { key: 'quality',   accent: '#4f46e5', accent2: '#06b6d4', Icon: Microscope },
  manage:    { key: 'manage',    accent: '#0369a1', accent2: '#14b8a6', Icon: ClipboardList },
};
