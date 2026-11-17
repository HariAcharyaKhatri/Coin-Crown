import { Season } from '../constants';
import { StorageClass, TradeRoute } from './defs';

export type { StorageClass, TradeRoute };

export interface BuildingInstance {
  instanceId: string;
  defId: string;
  level: number;
  condition: number; // 0 to 100
  depositRemaining?: number;
  assignedWorkerIds: string[];
  assignedManagerId?: string;
  createdAt: number;
}

export interface WorkerInstance {
  id: string;
  name: string;
  profession: string;
  skill: number;
  assignedBuildingInstanceId?: string;
}

export interface ManagerInstance {
  id: string;
  name: string;
  specialty: string;
  tier: number;
  assignedBuildingInstanceId?: string;
}

export interface MarketItemData {
  supply: number;
  demand: number;
  equilibriumSupply: number;
  equilibriumDemand: number;
  currentPrice: number;
}

export interface MarketEvent {
  id: string;
  name: string;
  multiplier: number;
  expiresAt: number;
  affectedItems: string[];
}

export interface GameState {
  version: number;
  createdAt: number;
  updatedAt: number;

  // Currency & Progress
  coins: number;
  lifetimeCoins: number;
  vault: number;
  vaultCapacity: number;
  playerLevel: number;
  playerXp: number;
  realmTier: number;

  // Geography & Land
  currentRegionId: string;
  unlockedRegions: string[];
  ownedPlots: number;
  unlockedPlotIds: string[];

  // Buildings & Upgrades
  buildings: Record<string, BuildingInstance>;
  firstTimeBuildXpGranted: string[];

  // Inventory & Storage
  inventory: Record<string, number>;
  storageCapacities: Record<StorageClass, number>;

  // Population & Employment
  workers: Record<string, WorkerInstance>;
  managers: Record<string, ManagerInstance>;
  population: {
    current: number;
    target: number;
    employed: number;
    homeless: number;
    satisfaction: number;
    unrest: number;
    taxRate: number;
    guards: number;
  };

  // Treasury
  treasury: {
    balance: number;
    cap: number;
    lastTaxCollectionTime: number;
    lifetimeTaxCollected: number;
    history: { timestamp: number; amount: number; type: string }[];
  };

  // Trade & Market
  trade: {
    routes: TradeRoute[];
    maxRoutes: number;
    totalRevenue: number;
    marketPrices: Record<string, MarketItemData>;
    activeEvents: MarketEvent[];
  };

  // Quests & Story
  quests: {
    activeQuestIds: string[];
    completedQuestIds: string[];
    objectivesProgress: Record<string, Record<number, number>>;
    decisions: Record<string, string>;
  };

  // Achievements
  achievements: {
    unlockedIds: string[];
    progress: Record<string, number>;
  };

  // Prestige & Dynasty
  prestige: {
    dynastySeals: number;
    lifetimeSeals: number;
    prestigeCount: number;
    legacyTree: Record<string, number>;
  };

  // Environmental
  season: {
    currentSeason: Season;
    seasonProgressMs: number;
    totalSeasonsElapsed: number;
  };

  // Tracking stats
  stats: {
    clickCollectCount: number;
    itemsProduced: Record<string, number>;
    itemsSold: Record<string, number>;
    relicFragments: number;
    dailyStreak: number;
    lastDailyReset: number;
    weeklyProgress: Record<string, number>;
  };
}

export type StatePatch = Partial<GameState> | ((prevState: GameState) => Partial<GameState>);
