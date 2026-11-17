export function calculateXpToNextLevel(level: number): number {
  return Math.round(40 * Math.pow(level, 1.4));
}

export function calculateFirstTimeBuildXp(buildingTier: number): number {
  return 10 * buildingTier;
}

export function calculatePrestigeSeals(lifetimeCoins: number): number {
  if (lifetimeCoins < 10_000_000) return 0;
  return Math.floor(Math.sqrt(lifetimeCoins / 10_000_000));
}

export const LEGACY_NODE_RANK_COSTS = [1, 2, 3, 5, 8] as const; // 19 seals per node
export const MAX_LEGACY_RANK = 5;

export function getLegacyRankCost(currentRank: number): number | null {
  if (currentRank >= MAX_LEGACY_RANK) return null;
  return LEGACY_NODE_RANK_COSTS[currentRank];
}
