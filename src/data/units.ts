import { UNITS_A } from './unitsA';
import { UNITS_B } from './unitsB';
import type { Unit2 } from './types';
export * from './types';
export const FOOD2_UNITS: Unit2[] = [...UNITS_A, ...UNITS_B];
export function getUnit2(id: number): Unit2 | undefined { return FOOD2_UNITS.find((u) => u.id === id); }
