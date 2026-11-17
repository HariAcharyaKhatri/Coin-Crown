import { GameState, StatePatch } from './types/state';
import { GameAction } from './types/actions';
import { OfflineEngine } from './engines/OfflineEngine';
import { PopulationEngine } from './engines/PopulationEngine';
import { FarmingEngine } from './engines/FarmingEngine';
import { PropertyEngine } from './engines/PropertyEngine';
import { ProductionEngine } from './engines/ProductionEngine';
import { MiningEngine } from './engines/MiningEngine';
import { TaxEngine } from './engines/TaxEngine';
import { TradeEngine } from './engines/TradeEngine';
import { EconomyEngine } from './engines/EconomyEngine';
import { ProgressionEngine } from './engines/ProgressionEngine';
import { PrestigeEngine } from './engines/PrestigeEngine';
import { SaveManager } from './engines/SaveManager';
import { calculateClickPower, calculateUpgradeCost, calculateDemolitionRefund } from './formulas/production';
import { calculateFirstTimeBuildXp } from './formulas/progression';
import { MAX_BUILDING_LEVEL } from './constants';
import buildingsData from '../data/buildings.json';
import itemsData from '../data/items.json';
import landData from '../data/land.json';
import workersData from '../data/workers.json';
import managersData from '../data/managers.json';
import { EventBus } from './events/EventBus';

export class GameEngine {
  private offlineEngine = new OfflineEngine();
  private populationEngine = new PopulationEngine();
  private farmingEngine = new FarmingEngine();
  private propertyEngine = new PropertyEngine();
  private productionEngine = new ProductionEngine();
  private miningEngine = new MiningEngine();
  private taxEngine = new TaxEngine();
  private tradeEngine = new TradeEngine();
  private economyEngine = new EconomyEngine();
  private progressionEngine = new ProgressionEngine();
  private saveManager = new SaveManager();

  private isRunning = false;
  private intervalId: any = null;

  /**
   * Runs a single tick across all 13 sub-engines in strict priority order.
   * Never throws; catches, logs, and continues.
   */
  public tick(deltaMs: number, state: GameState): GameState {
    let currentState = { ...state };

    const applyPatch = (patch: StatePatch | null) => {
      if (!patch) return;
      if (typeof patch === 'function') {
        const res = patch(currentState);
        currentState = { ...currentState, ...res };
      } else {
        currentState = { ...currentState, ...patch };
      }
    };

    try {
      // 5: OfflineEngine (first tick only)
      applyPatch(this.offlineEngine.tick(deltaMs, currentState));
      // 10: PopulationEngine
      applyPatch(this.populationEngine.tick(deltaMs, currentState));
      // 12: FarmingEngine
      applyPatch(this.farmingEngine.tick(deltaMs, currentState));
      // 15: PropertyEngine
      applyPatch(this.propertyEngine.tick(deltaMs, currentState));
      // 20: ProductionEngine
      applyPatch(this.productionEngine.tick(deltaMs, currentState));
      // 22: MiningEngine
      applyPatch(this.miningEngine.tick(deltaMs, currentState));
      // 30: TaxEngine
      applyPatch(this.taxEngine.tick(deltaMs, currentState));
      // 35: TradeEngine
      applyPatch(this.tradeEngine.tick(deltaMs, currentState));
      // 40: EconomyEngine
      applyPatch(this.economyEngine.tick(deltaMs, currentState));
      // 50: ProgressionEngine
      applyPatch(this.progressionEngine.tick(deltaMs, currentState));
      // 60: SaveManager.maybeAutosave (async, doesn't block tick)
      this.saveManager.maybeAutosave(currentState).catch((e) => {
        console.error('[GameEngine] Autosave background error:', e);
      });

      currentState.updatedAt = Date.now();
      EventBus.emit('TICK_COMPLETED', { deltaMs, timestamp: currentState.updatedAt });
    } catch (err) {
      console.error('[GameEngine] Critical tick failure caught:', err);
    }

    return currentState;
  }

  /**
   * Executes game actions dispatch.
   */
  public dispatch(action: GameAction, state: GameState): GameState {
    switch (action.type) {
      case 'CLICK_COLLECT': {
        const clickPower = calculateClickPower(state.playerLevel);
        const availableVault = Math.max(0, state.vaultCapacity - state.vault);
        const addedToVault = Math.min(clickPower, availableVault);
        const overflow = clickPower - addedToVault;

        return {
          ...state,
          vault: state.vault + addedToVault,
          coins: state.coins + overflow,
          lifetimeCoins: state.lifetimeCoins + clickPower,
          stats: {
            ...state.stats,
            clickCollectCount: state.stats.clickCollectCount + 1,
          },
        };
      }

      case 'EMPTY_VAULT': {
        const vaultCoins = state.vault;
        return {
          ...state,
          vault: 0,
          coins: state.coins + vaultCoins,
        };
      }

      case 'BUILD': {
        const def = buildingsData.find((b) => b.id === action.defId);
        if (!def) throw new Error(`Unknown building def: ${action.defId}`);
        if (state.coins < def.purchaseCost) {
          throw new Error(`Insufficient coins for ${def.name}: need ${def.purchaseCost}, have ${state.coins}`);
        }

        const instanceId = `inst.${def.id}.${Date.now()}.${Math.floor(Math.random() * 1000)}`;
        const isFirstBuild = !state.firstTimeBuildXpGranted.includes(def.id);
        const xpEarned = isFirstBuild ? calculateFirstTimeBuildXp(def.realmTier) : 0;

        const newBuildings = {
          ...state.buildings,
          [instanceId]: {
            instanceId,
            defId: def.id,
            level: 1,
            condition: 100,
            depositRemaining: def.depositMax,
            assignedWorkerIds: [],
            createdAt: Date.now(),
          },
        };

        const updatedFirstTime = isFirstBuild
          ? [...state.firstTimeBuildXpGranted, def.id]
          : state.firstTimeBuildXpGranted;

        EventBus.emit('BUILDING_CONSTRUCTED', { instanceId, defId: def.id });

        return {
          ...state,
          coins: state.coins - def.purchaseCost,
          buildings: newBuildings,
          playerXp: state.playerXp + xpEarned,
          firstTimeBuildXpGranted: updatedFirstTime,
        };
      }

      case 'UPGRADE': {
        const inst = state.buildings[action.instanceId];
        if (!inst) throw new Error(`Building instance not found: ${action.instanceId}`);
        const def = buildingsData.find((b) => b.id === inst.defId);
        if (!def) throw new Error(`Def not found: ${inst.defId}`);

        if (inst.level >= MAX_BUILDING_LEVEL) {
          throw new Error(`Building is at max level ${MAX_BUILDING_LEVEL}`);
        }

        const cost = calculateUpgradeCost(def.purchaseCost, inst.level + 1);
        if (state.coins < cost) {
          throw new Error(`Insufficient coins to upgrade: need ${cost}, have ${state.coins}`);
        }

        EventBus.emit('BUILDING_UPGRADED', { instanceId: inst.instanceId, newLevel: inst.level + 1 });

        return {
          ...state,
          coins: state.coins - cost,
          buildings: {
            ...state.buildings,
            [action.instanceId]: {
              ...inst,
              level: inst.level + 1,
            },
          },
        };
      }

      case 'DEMOLISH': {
        const inst = state.buildings[action.instanceId];
        if (!inst) throw new Error(`Building instance not found: ${action.instanceId}`);
        const def = buildingsData.find((b) => b.id === inst.defId);
        const refund = def ? calculateDemolitionRefund(def.purchaseCost) : 0;

        const newBuildings = { ...state.buildings };
        delete newBuildings[action.instanceId];

        // Unassign workers
        const newWorkers = { ...state.workers };
        for (const [wId, w] of Object.entries(newWorkers)) {
          if (w.assignedBuildingInstanceId === action.instanceId) {
            newWorkers[wId] = { ...w, assignedBuildingInstanceId: undefined };
          }
        }

        EventBus.emit('BUILDING_DEMOLISHED', { instanceId: action.instanceId, refund });

        return {
          ...state,
          coins: state.coins + refund,
          buildings: newBuildings,
          workers: newWorkers,
        };
      }

      case 'REPAIR_BUILDING': {
        const inst = state.buildings[action.instanceId];
        if (!inst) throw new Error(`Building instance not found: ${action.instanceId}`);
        const def = buildingsData.find((b) => b.id === inst.defId);
        const repairCost = Math.round((def?.purchaseCost ?? 100) * 0.10 * ((100 - inst.condition) / 100));

        if (state.coins < repairCost) {
          throw new Error(`Insufficient coins to repair: need ${repairCost}`);
        }

        return {
          ...state,
          coins: state.coins - repairCost,
          buildings: {
            ...state.buildings,
            [action.instanceId]: {
              ...inst,
              condition: 100,
            },
          },
        };
      }

      case 'SELL_ITEM': {
        const currentQty = state.inventory[action.itemId] ?? 0;
        if (currentQty < action.quantity) {
          throw new Error(`Insufficient inventory: have ${currentQty}, trying to sell ${action.quantity}`);
        }

        const price = state.trade.marketPrices[action.itemId]?.currentPrice ?? 2;
        const revenue = price * action.quantity;

        const newInv = {
          ...state.inventory,
          [action.itemId]: currentQty - action.quantity,
        };

        EventBus.emit('ITEM_SOLD', { itemId: action.itemId, quantity: action.quantity, revenue });

        return {
          ...state,
          coins: state.coins + revenue,
          lifetimeCoins: state.lifetimeCoins + revenue,
          inventory: newInv,
          stats: {
            ...state.stats,
            itemsSold: {
              ...state.stats.itemsSold,
              [action.itemId]: (state.stats.itemsSold[action.itemId] ?? 0) + action.quantity,
            },
          },
        };
      }

      case 'BUY_ITEM': {
        const itemDef = itemsData.find((i) => i.id === action.itemId);
        if (!itemDef) throw new Error(`Unknown item: ${action.itemId}`);
        const price = state.trade.marketPrices[action.itemId]?.currentPrice ?? itemDef.baseValue;
        const totalCost = price * action.quantity;

        if (state.coins < totalCost) {
          throw new Error(`Insufficient coins: need ${totalCost}, have ${state.coins}`);
        }

        const currentQty = state.inventory[action.itemId] ?? 0;
        const maxStorage = state.storageCapacities[itemDef.storageClass as keyof typeof state.storageCapacities] ?? 1000;
        if (currentQty + action.quantity > maxStorage) {
          throw new Error(`Storage full for class ${itemDef.storageClass}`);
        }

        return {
          ...state,
          coins: state.coins - totalCost,
          inventory: {
            ...state.inventory,
            [action.itemId]: currentQty + action.quantity,
          },
        };
      }

      case 'HIRE_WORKER': {
        const wDef = workersData.find((w) => w.profession === action.profession);
        const cost = wDef?.hireCost ?? 50;
        if (state.coins < cost) {
          throw new Error(`Insufficient coins to hire worker: need ${cost}`);
        }

        const workerId = `wrk.${action.profession}.${Date.now()}`;
        return {
          ...state,
          coins: state.coins - cost,
          workers: {
            ...state.workers,
            [workerId]: {
              id: workerId,
              name: action.name ?? `Worker ${Object.keys(state.workers).length + 1}`,
              profession: action.profession,
              skill: 1,
            },
          },
        };
      }

      case 'ASSIGN_WORKER': {
        const worker = state.workers[action.workerId];
        const inst = state.buildings[action.buildingInstanceId];
        if (!worker || !inst) throw new Error('Worker or building not found');
        const def = buildingsData.find((b) => b.id === inst.defId);

        if (inst.assignedWorkerIds.length >= (def?.workerSlots ?? 0)) {
          throw new Error('Building worker slots are full');
        }

        return {
          ...state,
          workers: {
            ...state.workers,
            [action.workerId]: {
              ...worker,
              assignedBuildingInstanceId: action.buildingInstanceId,
            },
          },
          buildings: {
            ...state.buildings,
            [action.buildingInstanceId]: {
              ...inst,
              assignedWorkerIds: [...inst.assignedWorkerIds, action.workerId],
            },
          },
        };
      }

      case 'UNASSIGN_WORKER': {
        const worker = state.workers[action.workerId];
        if (!worker || !worker.assignedBuildingInstanceId) return state;
        const inst = state.buildings[worker.assignedBuildingInstanceId];

        return {
          ...state,
          workers: {
            ...state.workers,
            [action.workerId]: {
              ...worker,
              assignedBuildingInstanceId: undefined,
            },
          },
          buildings: inst
            ? {
                ...state.buildings,
                [inst.instanceId]: {
                  ...inst,
                  assignedWorkerIds: inst.assignedWorkerIds.filter((id) => id !== action.workerId),
                },
              }
            : state.buildings,
        };
      }

      case 'HIRE_MANAGER': {
        const mDef = managersData.find((m) => m.specialty === action.specialty);
        const cost = mDef?.hireCost ?? 500;
        if (state.coins < cost) {
          throw new Error(`Insufficient coins to hire manager: need ${cost}`);
        }

        const mgrId = `mgr.${action.specialty}.${Date.now()}`;
        return {
          ...state,
          coins: state.coins - cost,
          managers: {
            ...state.managers,
            [mgrId]: {
              id: mgrId,
              name: action.name ?? mDef?.name ?? 'Manager',
              specialty: action.specialty,
              tier: 1,
            },
          },
        };
      }

      case 'ASSIGN_MANAGER': {
        const mgr = state.managers[action.managerId];
        const inst = state.buildings[action.buildingInstanceId];
        if (!mgr || !inst) throw new Error('Manager or building not found');

        return {
          ...state,
          managers: {
            ...state.managers,
            [action.managerId]: {
              ...mgr,
              assignedBuildingInstanceId: action.buildingInstanceId,
            },
          },
          buildings: {
            ...state.buildings,
            [action.buildingInstanceId]: {
              ...inst,
              assignedManagerId: action.managerId,
            },
          },
        };
      }

      case 'UNASSIGN_MANAGER': {
        const mgr = state.managers[action.managerId];
        if (!mgr || !mgr.assignedBuildingInstanceId) return state;
        const inst = state.buildings[mgr.assignedBuildingInstanceId];

        return {
          ...state,
          managers: {
            ...state.managers,
            [action.managerId]: {
              ...mgr,
              assignedBuildingInstanceId: undefined,
            },
          },
          buildings: inst
            ? {
                ...state.buildings,
                [inst.instanceId]: {
                  ...inst,
                  assignedManagerId: undefined,
                },
              }
            : state.buildings,
        };
      }

      case 'UPGRADE_MANAGER': {
        const mgr = state.managers[action.managerId];
        if (!mgr) throw new Error('Manager not found');
        const cost = 1000 * Math.pow(2, mgr.tier);
        if (state.coins < cost) {
          throw new Error(`Insufficient coins to upgrade manager: need ${cost}`);
        }

        return {
          ...state,
          coins: state.coins - cost,
          managers: {
            ...state.managers,
            [action.managerId]: {
              ...mgr,
              tier: mgr.tier + 1,
            },
          },
        };
      }

      case 'SET_TAX_RATE': {
        const clampedRate = Math.max(0.0, Math.min(0.50, action.rate));
        return {
          ...state,
          population: {
            ...state.population,
            taxRate: clampedRate,
          },
        };
      }

      case 'COLLECT_TAX': {
        const taxCoins = state.treasury.balance;
        EventBus.emit('TAX_COLLECTED', { amount: taxCoins });
        return {
          ...state,
          coins: state.coins + taxCoins,
          lifetimeCoins: state.lifetimeCoins + taxCoins,
          treasury: {
            ...state.treasury,
            balance: 0,
            lastTaxCollectionTime: Date.now(),
          },
        };
      }

      case 'ESTABLISH_ROUTE': {
        const newRoute = {
          id: `route.${Date.now()}`,
          originRegionId: action.route.originRegionId,
          destinationRegionId: action.route.destinationRegionId,
          itemId: action.route.itemId,
          quantity: action.route.quantity,
          durationSeconds: 60,
          elapsedSeconds: 0,
          profitPerRun: 150,
          active: true,
        };
        return {
          ...state,
          trade: {
            ...state.trade,
            routes: [...state.trade.routes, newRoute],
          },
        };
      }

      case 'CANCEL_ROUTE': {
        return {
          ...state,
          trade: {
            ...state.trade,
            routes: state.trade.routes.filter((r) => r.id !== action.routeId),
          },
        };
      }

      case 'BUY_PLOT': {
        const cost = Math.round(landData.basePlotCost * Math.pow(landData.costMultiplierPerPlot, state.ownedPlots));
        if (state.coins < cost) {
          throw new Error(`Insufficient coins for land plot: need ${cost}`);
        }
        return {
          ...state,
          coins: state.coins - cost,
          ownedPlots: state.ownedPlots + 1,
          unlockedPlotIds: [...state.unlockedPlotIds, action.plotId],
        };
      }

      case 'SWITCH_REGION': {
        return {
          ...state,
          currentRegionId: action.regionId,
        };
      }

      case 'MAKE_DECISION': {
        return {
          ...state,
          quests: {
            ...state.quests,
            decisions: {
              ...state.quests.decisions,
              [action.questId]: action.decisionId,
            },
          },
        };
      }

      case 'PRESTIGE': {
        return PrestigeEngine.executePrestige(state);
      }

      case 'UPGRADE_LEGACY': {
        return PrestigeEngine.upgradeLegacyNode(state, action.nodeId);
      }

      default:
        return state;
    }
  }

  public start(getState: () => GameState, setState: (state: GameState) => void): void {
    if (this.isRunning) return;
    this.isRunning = true;
    let lastTime = Date.now();

    this.intervalId = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTime;
      lastTime = now;

      const currentState = getState();
      const updatedState = this.tick(deltaMs, currentState);
      setState(updatedState);
    }, 1000);
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
