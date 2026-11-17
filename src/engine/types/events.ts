import { Season } from '../constants';

export type GameEventType =
  | 'TICK_COMPLETED'
  | 'COINS_CHANGED'
  | 'BUILDING_CONSTRUCTED'
  | 'BUILDING_UPGRADED'
  | 'BUILDING_DEMOLISHED'
  | 'ITEM_PRODUCED'
  | 'ITEM_CONSUMED'
  | 'ITEM_SOLD'
  | 'WORKER_HIRED'
  | 'WORKER_ASSIGNED'
  | 'MANAGER_HIRED'
  | 'MANAGER_ASSIGNED'
  | 'TAX_COLLECTED'
  | 'TIER_UNLOCKED'
  | 'QUEST_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'SEASON_CHANGED'
  | 'PRESTIGE_PERFORMED'
  | 'MARKET_EVENT_TRIGGERED'
  | 'SAVE_COMPLETED'
  | 'ERROR_OCCURRED';

export interface GameEvent<T = unknown> {
  type: GameEventType;
  payload: T;
  timestamp: number;
}

export interface SeasonChangeEventPayload {
  previousSeason: Season;
  currentSeason: Season;
}

export interface TierUnlockEventPayload {
  previousTier: number;
  newTier: number;
}
