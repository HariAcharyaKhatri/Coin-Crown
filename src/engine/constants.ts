export const CLICK_BASE = 1;
export const CLICK_LEVEL_BONUS = 0.5;
export const UPGRADE_COST_MULT = 1.60;
export const UPGRADE_OUTPUT_MULT = 1.45;
export const MAX_BUILDING_LEVEL = 25;
export const OFFLINE_EFFICIENCY = 0.60;
export const OFFLINE_CAP_MS = 86_400_000; // 24 hours in ms
export const VAULT_BASE_HOURS = 2;
export const TAX_NEUTRAL_RATE = 0.15;
export const TAX_MIN_RATE = 0.00;
export const TAX_MAX_RATE = 0.50;
export const MARKET_MIN_MULT = 0.50;
export const MARKET_MAX_MULT = 2.00;
export const MARKET_MEAN_REVERSION_PER_SECOND = 0.02 / 60;
export const UNREST_MAX_OUTPUT_PENALTY = 0.35;
export const DEMOLITION_REFUND_PURCHASE = 0.50;
export const DEMOLITION_REFUND_UPGRADE = 0.00;
export const SEASON_LENGTH_MS = 86_400_000; // 24 hours
export const CURRENT_SCHEMA_VERSION = 4;

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

export const SEASON_MULTIPLIERS: Record<Season, number> = {
  spring: 1.00,
  summer: 1.15,
  autumn: 1.30,
  winter: 0.45,
};

export const PROFESSION_WAGE_MULTIPLIERS: Record<string, number> = {
  farmer: 1.00,
  miner: 1.15,
  builder: 1.20,
  craftsman: 1.10,
  merchant: 1.10,
  guard: 1.05,
  administrator: 1.15,
  scholar: 1.25,
};

export const REGION_GROWTH_MULTIPLIERS: Record<string, number> = {
  'reg.greenvale': 1.0,
  'reg.riverford': 1.1,
  'reg.highcourt': 0.8,
};
