function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function calculateMarketPrice(
  baseValue: number,
  supply: number,
  demand: number,
  eventMult: number = 1.0,
  regionMult: number = 1.0
): number {
  const effectiveSupply = Math.max(supply, 0.1);
  const ratio = clamp(demand / effectiveSupply, 0.5, 2.0);
  const calculated = baseValue * ratio * eventMult * regionMult;
  return clamp(calculated, baseValue * 0.5, baseValue * 2.0);
}

export function revertSupplyDemand(
  current: number,
  equilibrium: number,
  reversionFactor: number = 0.02
): number {
  return current + (equilibrium - current) * reversionFactor;
}
