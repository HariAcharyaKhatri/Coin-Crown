function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function calculateMiningRates(
  baseOutput: number,
  level: number,
  skillBonus: number,
  managerBonus: number,
  depositRemaining: number,
  depositMax: number
): { extractionPerMinute: number; replenishmentPerMinute: number; netChangePerMinute: number } {
  const m = (1 + skillBonus) * (1 + managerBonus);
  const levelMult = Math.pow(1.45, level - 1);

  const depositFactor = clamp(depositRemaining / (depositMax * 0.5), 0.10, 1.0);
  const extraction = baseOutput * levelMult * m * depositFactor;
  const replenishment = baseOutput * levelMult * m * 0.5 * (1 - depositRemaining / depositMax);

  return {
    extractionPerMinute: extraction,
    replenishmentPerMinute: replenishment,
    netChangePerMinute: replenishment - extraction,
  };
}
