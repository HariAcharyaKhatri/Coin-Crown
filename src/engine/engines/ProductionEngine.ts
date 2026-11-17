import { GameState, StatePatch } from '../types/state';
import { calculateBuildingOutputPerMinute, calculateWorkerSkillBonus } from '../formulas/production';
import { calculateUnrestPenalty } from '../formulas/taxation';
import buildingsData from '../../data/buildings.json';
import itemsData from '../../data/items.json';

export class ProductionEngine {
  public tick(deltaMs: number, state: GameState): StatePatch | null {
    try {
      const deltaMin = deltaMs / 60000;
      const unrestPenalty = calculateUnrestPenalty(state.population.unrest);
      const newInventory = { ...state.inventory };
      const itemsProducedThisTick: Record<string, number> = {};

      for (const inst of Object.values(state.buildings)) {
        const def = buildingsData.find((b) => b.id === inst.defId);
        if (!def || def.baseOutput.length === 0) continue;
        // Mining is handled by MiningEngine
        if (def.category === 'mining') continue;

        // In Frostmere, farming disabled during winter
        if (state.currentRegionId === 'reg.frostmere' && state.season.currentSeason === 'winter' && def.category === 'agriculture') {
          continue;
        }

        // Calculate worker skill bonus
        let avgSkill = 1;
        if (inst.assignedWorkerIds.length > 0) {
          const totalSkill = inst.assignedWorkerIds.reduce((sum, wid) => {
            const w = state.workers[wid];
            return sum + (w ? w.skill : 1);
          }, 0);
          avgSkill = totalSkill / inst.assignedWorkerIds.length;
        }
        const workerSkillBonus = calculateWorkerSkillBonus(avgSkill);

        // Manager bonus
        let managerBonus = 0;
        if (inst.assignedManagerId && state.managers[inst.assignedManagerId]) {
          managerBonus = 0.15; // default manager tier bonus
        }

        // Check input constraints if any
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

          // Consume inputs
          for (const inp of def.baseInputs) {
            const needed = inp.amountPerMinute * deltaMin;
            newInventory[inp.itemId] = Math.max(0, (newInventory[inp.itemId] ?? 0) - needed);
          }
        }

        // Produce outputs
        for (const out of def.baseOutput) {
          const itemDef = itemsData.find((i) => i.id === out.itemId);
          if (!itemDef) continue;

          const qty = calculateBuildingOutputPerMinute(
            out.amountPerMinute,
            inst.level,
            workerSkillBonus,
            managerBonus,
            state.season.currentSeason,
            1.0,
            unrestPenalty
          ) * deltaMin;

          const currentQty = newInventory[out.itemId] ?? 0;
          const storageClass = itemDef.storageClass as keyof typeof state.storageCapacities;
          const maxStorage = state.storageCapacities[storageClass] ?? 1000;

          const newQty = Math.min(maxStorage, currentQty + qty);
          newInventory[out.itemId] = newQty;
          itemsProducedThisTick[out.itemId] = (itemsProducedThisTick[out.itemId] ?? 0) + qty;
        }
      }

      return (prevState: GameState) => {
        const updatedStatsProduced = { ...prevState.stats.itemsProduced };
        for (const [itemId, qty] of Object.entries(itemsProducedThisTick)) {
          updatedStatsProduced[itemId] = (updatedStatsProduced[itemId] ?? 0) + qty;
        }

        return {
          inventory: newInventory,
          stats: {
            ...prevState.stats,
            itemsProduced: updatedStatsProduced,
          },
        };
      };
    } catch (err) {
      console.error('[ProductionEngine] Error during tick:', err);
      return null;
    }
  }
}
