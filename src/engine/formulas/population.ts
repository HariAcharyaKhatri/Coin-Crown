import { PROFESSION_WAGE_MULTIPLIERS, REGION_GROWTH_MULTIPLIERS } from '../constants';

export function calculateHousingCapacity(
  buildings: { capacity: number; condition: number }[]
): number {
  return buildings.reduce(
    (total, b) => total + Math.floor(b.capacity * (b.condition / 100)),
    0
  );
}

export function calculateTargetPopulation(
  housingCapacity: number,
  satisfaction: number
): number {
  return housingCapacity * (0.6 + 0.4 * (satisfaction / 100));
}

export function calculatePopulationGrowth(
  currentPop: number,
  targetPop: number,
  satisfaction: number,
  regionId: string = 'reg.greenvale',
  deltaMs: number = 1000
): number {
  const deltaMin = deltaMs / 60000;
  if (satisfaction < 30) {
    // Emigration: -0.05 * current per min
    return -0.05 * currentPop * deltaMin;
  }
  const regionMult = REGION_GROWTH_MULTIPLIERS[regionId] ?? 1.0;
  // growth per second = (target_pop - current) * 0.001 * regionGrowthMult
  const deltaSec = deltaMs / 1000;
  return (targetPop - currentPop) * 0.001 * regionMult * deltaSec;
}

export function calculateRent(
  baseRent: number,
  level: number,
  condition: number
): number {
  const levelMult = Math.pow(1.45, level - 1);
  return baseRent * levelMult * (0.4 + 0.6 * (condition / 100));
}

export function calculateConditionDecay(currentCondition: number, deltaMs: number): number {
  const decay = 1.0 * (deltaMs / 86_400_000); // 1% per 24 hours
  return Math.max(0, currentCondition - decay);
}

export function calculateWagePerMinute(
  profession: string,
  skill: number,
  regionWageMult: number = 1.0
): number {
  const profMult = PROFESSION_WAGE_MULTIPLIERS[profession] ?? 1.0;
  return 1 * profMult * regionWageMult * (1 + skill * 0.05);
}
