export type BuildingCategory =
  | 'residential'
  | 'agriculture'
  | 'industrial'
  | 'mining'
  | 'commercial'
  | 'royal';

export interface BuildingOutputItem {
  itemId: string;
  amountPerMinute: number;
}

export interface BuildingInputItem {
  itemId: string;
  amountPerMinute: number;
}

export interface BuildingDef {
  id: string;
  name: string;
  category: BuildingCategory;
  realmTier: number;
  landCategory: string;
  purchaseCost: number;
  constructionSeconds: number;
  baseOutput: BuildingOutputItem[];
  baseInputs?: BuildingInputItem[];
  baseIncomePerMinute: number;
  baseMaintenancePerMinute: number;
  workerSlots: number;
  workerProfession?: string;
  managerSlots: number;
  compatibleManagers: string[];
  unlockConditions: string[];
  dependencies: string[];
  housingCapacity: number;
  taxBasePerMinute: number;
  commercialIncomeType?: string;
  depositMax?: number;
}

export type StorageClass = 'bulk' | 'standard' | 'precious' | 'perishable';

export type ItemCategory = 'raw' | 'processed' | 'luxury' | 'construction' | 'quest';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  tier: number;
  baseValue: number;
  storageClass: StorageClass;
  perishableHours?: number;
  marketDemand: number;
  volatility: number;
  uses: string[];
  unlockTier: number;
}

export interface QuestObjective {
  type: string;
  targetId?: string;
  count: number;
  description: string;
}

export interface QuestReward {
  type: 'coins' | 'item' | 'xp' | 'land_deed' | 'dynasty_seal' | 'relic_fragment';
  id?: string;
  amount: number;
}

export interface QuestDef {
  questId: string;
  chapter: number;
  title: string;
  description: string;
  objectives: QuestObjective[];
  optionalObjectives?: QuestObjective[];
  rewards: QuestReward[];
  prerequisites: string[];
  decisions?: { id: string; text: string; outcome: string }[];
  unlockTier: number;
}

export interface AchievementCondition {
  type: string;
  target?: string | number;
  threshold: number;
}

export interface AchievementDef {
  achievementId: string;
  scope: 'lifetime' | 'story' | 'daily' | 'weekly';
  title: string;
  description: string;
  condition: AchievementCondition;
  reward: { type: string; amount: number }[];
  hidden: boolean;
}

export interface RegionDef {
  id: string;
  name: string;
  tier: number;
  description: string;
  perks: {
    cropYieldMult?: number;
    agriLandDiscount?: number;
    tradeProfitMult?: number;
    fishYieldMult?: number;
    caravanDiscount?: number;
    timberYieldMult?: number;
    woodcutterDiscount?: number;
    stoneYieldMult?: number;
    stoneBuildDiscount?: number;
    ironYieldMult?: number;
    copperYieldMult?: number;
    smelterFuelDiscount?: number;
    wineYieldMult?: number;
    livestockYieldMult?: number;
    luxurySaleMult?: number;
    taxMult?: number;
    rentMult?: number;
    wagesMult?: number;
    goldYieldMult?: number;
    refineryCostDiscount?: number;
    royalIncomeMult?: number;
    bonusManagerSlots?: number;
    farmingDisabledWinter?: boolean;
    uniqueLuxuryOnly?: boolean;
  };
}

export interface WorkerDef {
  id: string;
  name: string;
  profession: string;
  skillLevel: number;
  assignedBuildingId?: string;
}

export interface ManagerDef {
  id: string;
  name: string;
  specialty: string;
  level: number;
  bonusMultiplier: number;
  assignedBuildingId?: string;
}

export interface TradeRoute {
  id: string;
  originRegionId: string;
  destinationRegionId: string;
  itemId: string;
  quantity: number;
  durationSeconds: number;
  elapsedSeconds: number;
  profitPerRun: number;
  active: boolean;
}
