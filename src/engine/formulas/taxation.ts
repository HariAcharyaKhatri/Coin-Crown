function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function calculateTaxSatisfactionMultiplier(taxRate: number): number {
  return clamp(1.0 - (taxRate - 0.15) * 1.2, 0.35, 1.15);
}

export function calculateTaxIncomePerMinute(
  taxBaseSum: number,
  taxRate: number,
  taxEfficiency: number = 1.0
): number {
  const satMult = calculateTaxSatisfactionMultiplier(taxRate);
  return taxBaseSum * taxRate * taxEfficiency * satMult;
}

export function calculateSatisfactionTarget(
  taxRate: number,
  churches: number = 0,
  universities: number = 0,
  housingShortagePenalty: number = 0
): number {
  return clamp(
    70 - (taxRate - 0.15) * 160 + churches * 8 + universities * 4 - housingShortagePenalty,
    0,
    100
  );
}

export function updateSatisfaction(
  currentSat: number,
  targetSat: number,
  deltaMs: number
): number {
  const deltaSec = deltaMs / 1000;
  return clamp(currentSat + (targetSat - currentSat) * 0.0005 * deltaSec, 0, 100);
}

export function calculateGuardReduction(
  guardCount: number,
  avgGuardSkill: number = 1,
  hasBarracks: boolean = false
): number {
  return (
    guardCount *
    0.3 *
    (1 + avgGuardSkill * 0.05) *
    (hasBarracks ? 1.2 : 1.0)
  );
}

export function calculateUnrestTarget(
  taxRate: number,
  guardReduction: number
): number {
  // target = max(0, (taxRate - 0.20)*200 - guardReduction)
  return Math.max(0, (taxRate - 0.20) * 200 - guardReduction);
}

export function updateUnrest(
  currentUnrest: number,
  targetUnrest: number,
  deltaMs: number
): number {
  const deltaSec = deltaMs / 1000;
  return clamp(currentUnrest + (targetUnrest - currentUnrest) * 0.0003 * deltaSec, 0, 100);
}

export function calculateUnrestPenalty(unrest: number): number {
  if (unrest <= 25) return 0;
  if (unrest <= 50) return 0.10;
  if (unrest <= 75) return 0.20;
  return 0.35;
}
