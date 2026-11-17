import { create } from 'zustand';
import { GameState } from '../engine/types/state';
import { GameAction } from '../engine/types/actions';
import { GameEngine } from '../engine/GameEngine';
import balanceData from '../data/balance.json';

export const createInitialState = (): GameState => ({
  version: 4,
  createdAt: Date.now(),
  updatedAt: Date.now(),

  coins: balanceData.startingCoins,
  lifetimeCoins: balanceData.startingCoins,
  vault: balanceData.startingVault,
  vaultCapacity: balanceData.startingVaultCapacity,
  playerLevel: 1,
  playerXp: 0,
  realmTier: 1,

  currentRegionId: 'reg.greenvale',
  unlockedRegions: ['reg.greenvale'],
  ownedPlots: 1,
  unlockedPlotIds: ['plot.reg.greenvale.001'],

  buildings: {},
  firstTimeBuildXpGranted: [],

  inventory: {},
  storageCapacities: { ...balanceData.startingStorage },

  workers: {},
  managers: {},
  population: {
    current: 5,
    target: 5,
    employed: 0,
    homeless: 0,
    satisfaction: 70,
    unrest: 0,
    taxRate: 0.15,
    guards: 0,
  },

  treasury: {
    balance: 0,
    cap: balanceData.startingTreasuryCap,
    lastTaxCollectionTime: Date.now(),
    lifetimeTaxCollected: 0,
    history: [],
  },

  trade: {
    routes: [],
    maxRoutes: 1,
    totalRevenue: 0,
    marketPrices: {},
    activeEvents: [],
  },

  quests: {
    activeQuestIds: ['qst.ch01.001'],
    completedQuestIds: [],
    objectivesProgress: {},
    decisions: {},
  },

  achievements: {
    unlockedIds: [],
    progress: {},
  },

  prestige: {
    dynastySeals: 0,
    lifetimeSeals: 0,
    prestigeCount: 0,
    legacyTree: {},
  },

  season: {
    currentSeason: 'spring',
    seasonProgressMs: 0,
    totalSeasonsElapsed: 0,
  },

  stats: {
    clickCollectCount: 0,
    itemsProduced: {},
    itemsSold: {},
    relicFragments: 0,
    dailyStreak: 1,
    lastDailyReset: Date.now(),
    weeklyProgress: {},
  },
});

export interface GameStoreState {
  gameState: GameState;
  engine: GameEngine;
  dispatch: (action: GameAction) => void;
  setGameState: (state: GameState) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const engine = new GameEngine();

  return {
    gameState: createInitialState(),
    engine,
    dispatch: (action: GameAction) => {
      const current = get().gameState;
      const updated = engine.dispatch(action, current);
      set({ gameState: updated });
    },
    setGameState: (state: GameState) => set({ gameState: state }),
    resetGame: () => set({ gameState: createInitialState() }),
  };
});
