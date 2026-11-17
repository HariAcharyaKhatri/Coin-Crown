import { GameState } from '../types/state';
import { calculatePrestigeSeals, getLegacyRankCost, MAX_LEGACY_RANK } from '../formulas/progression';
import balanceData from '../../data/balance.json';
import { EventBus } from '../events/EventBus';

export class PrestigeEngine {
  public static canPrestige(state: GameState): boolean {
    return state.realmTier >= 8 && state.lifetimeCoins >= 10_000_000;
  }

  public static getSealsToGrant(lifetimeCoins: number): number {
    return calculatePrestigeSeals(lifetimeCoins);
  }

  public static executePrestige(state: GameState): GameState {
    if (!this.canPrestige(state)) {
      throw new Error('Prestige conditions not met (requires Tier >= 8 and lifetimeCoins >= 10M)');
    }

    const sealsGranted = this.getSealsToGrant(state.lifetimeCoins);

    const nextState: GameState = {
      ...state,
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
      // Keep scope:
      firstTimeBuildXpGranted: [...state.firstTimeBuildXpGranted],
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
        unlockedIds: [...state.achievements.unlockedIds],
        progress: { ...state.achievements.progress },
      },
      prestige: {
        dynastySeals: state.prestige.dynastySeals + sealsGranted,
        lifetimeSeals: state.prestige.lifetimeSeals + sealsGranted,
        prestigeCount: state.prestige.prestigeCount + 1,
        legacyTree: { ...state.prestige.legacyTree },
      },
      season: {
        currentSeason: 'spring',
        seasonProgressMs: 0,
        totalSeasonsElapsed: state.season.totalSeasonsElapsed,
      },
      stats: {
        ...state.stats,
        clickCollectCount: 0,
        itemsProduced: {},
        itemsSold: {},
      },
      updatedAt: Date.now(),
    };

    EventBus.emit('PRESTIGE_PERFORMED', { sealsGranted });
    return nextState;
  }

  public static upgradeLegacyNode(state: GameState, nodeId: string): GameState {
    const currentRank = state.prestige.legacyTree[nodeId] ?? 0;
    if (currentRank >= MAX_LEGACY_RANK) {
      throw new Error(`Legacy node ${nodeId} is already at max rank ${MAX_LEGACY_RANK}`);
    }

    const cost = getLegacyRankCost(currentRank);
    if (cost === null || state.prestige.dynastySeals < cost) {
      throw new Error(`Insufficient Dynasty Seals: have ${state.prestige.dynastySeals}, need ${cost}`);
    }

    return {
      ...state,
      prestige: {
        ...state.prestige,
        dynastySeals: state.prestige.dynastySeals - cost,
        legacyTree: {
          ...state.prestige.legacyTree,
          [nodeId]: currentRank + 1,
        },
      },
    };
  }
}
