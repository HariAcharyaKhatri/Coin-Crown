import { GameState, StatePatch, BuildingInstance } from '../types/state';
import { calculateMiningRates } from '../formulas/mining';
import { calculateWorkerSkillBonus } from '../formulas/production';
import buildingsData from '../../data/buildings.json';
import itemsData from '../../data/items.json';

export class MiningEngine {
  public tick(deltaMs: number, state: GameState): StatePatch | null {
    try {
      const deltaMin = deltaMs / 60000;
      const updatedBuildings: Record<string, BuildingInstance> = { ...state.buildings };
      const newInventory = { ...state.inventory };
      const oreProducedThisTick: Record<string, number> = {};

      for (const [id, inst] of Object.entries(state.buildings)) {
        const def = buildingsData.find((b) => b.id === inst.defId);
        if (!def || def.category !== 'mining' || def.baseOutput.length === 0) continue;

        const depositMax = def.depositMax ?? 20000;
        const depositRemaining = inst.depositRemaining ?? depositMax;

        // Skill bonus
        let avgSkill = 1;
        if (inst.assignedWorkerIds.length > 0) {
          const totalSkill = inst.assignedWorkerIds.reduce((sum, wid) => {
            const w = state.workers[wid];
            return sum + (w ? w.skill : 1);
          }, 0);
          avgSkill = totalSkill / inst.assignedWorkerIds.length;
        }
        const skillBonus = calculateWorkerSkillBonus(avgSkill);

        // Manager bonus
        let managerBonus = 0;
        if (inst.assignedManagerId && state.managers[inst.assignedManagerId]) {
          managerBonus = 0.20; // mine foreman bonus
        }

        // Smelter input handling
        if (def.baseInputs && def.baseInputs.length > 0) {
          let canProduce = true;
          for (const inp of def.baseInputs) {
            const needed = inp.amountPerMinute * deltaMin;
            if ((newInventory[inp.itemId] ?? 0) < needed) {
              canProduce = false;
              break;
            }
          }
          if (!canProduce) continue;

          for (const inp of def.baseInputs) {
            const needed = inp.amountPerMinute * deltaMin;
            newInventory[inp.itemId] = Math.max(0, (newInventory[inp.itemId] ?? 0) - needed);
          }
        }

        for (const out of def.baseOutput) {
          const rates = calculateMiningRates(
            out.amountPerMinute,
            inst.level,
            skillBonus,
            managerBonus,
            depositRemaining,
            depositMax
          );

          const extracted = rates.extractionPerMinute * deltaMin;
          const netDepositChange = rates.netChangePerMinute * deltaMin;
          const nextDeposit = Math.max(0, Math.min(depositMax, depositRemaining + netDepositChange));

          updatedBuildings[id] = {
            ...inst,
            depositRemaining: Math.round(nextDeposit * 100) / 100,
          };

          const itemDef = itemsData.find((i) => i.id === out.itemId);
          if (itemDef) {
            const storageClass = itemDef.storageClass as keyof typeof state.storageCapacities;
            const maxStorage = state.storageCapacities[storageClass] ?? 1000;
            const currentQty = newInventory[out.itemId] ?? 0;
            newInventory[out.itemId] = Math.min(maxStorage, currentQty + extracted);
            oreProducedThisTick[out.itemId] = (oreProducedThisTick[out.itemId] ?? 0) + extracted;
          }
        }
      }

      return (prevState: GameState) => {
        const updatedStats = { ...prevState.stats.itemsProduced };
        for (const [itemId, qty] of Object.entries(oreProducedThisTick)) {
          updatedStats[itemId] = (updatedStats[itemId] ?? 0) + qty;
        }

        return {
          buildings: updatedBuildings,
          inventory: newInventory,
          stats: {
            ...prevState.stats,
            itemsProduced: updatedStats,
          },
        };
      };
    } catch (err) {
      console.error('[MiningEngine] Error during tick:', err);
      return null;
    }
  }
}
