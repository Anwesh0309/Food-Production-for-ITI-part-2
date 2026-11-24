import { lazy, type ComponentType } from 'react';

/** Registry of Module 2 simulations (simId → component). Each is an independent, lazily loaded component. */
export const food2Simulations: Record<string, React.LazyExoticComponent<ComponentType>> = {
  m2Market: lazy(() => import('./MarketSim')),
  m2Precision: lazy(() => import('./PrecisionSim')),
  m2HeatLab: lazy(() => import('./HeatLabSim')),
  m2SauceStudio: lazy(() => import('./SauceStudioSim')),
  m2EggCold: lazy(() => import('./EggColdSim')),
  m2WorldKitchen: lazy(() => import('./WorldKitchenSim')),
  m2Butchery: lazy(() => import('./ButcherySim')),
  m2PastryLab: lazy(() => import('./PastryLabSim')),
  m2QualityLab: lazy(() => import('./QualityLabSim')),
  m2KitchenManager: lazy(() => import('./KitchenManagerSim')),
};
export const getFood2Sim = (id: string) => food2Simulations[id];
