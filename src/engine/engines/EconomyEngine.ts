import { GameState, StatePatch } from '../types/state';
import { calculateMaintenancePerMinute } from '../formulas/production';
import { calculateWagePerMinute } from '../formulas/population';
import buildingsData from '../../data/buildings.json';
import regionsData from '../../data/regions.json';

export class EconomyEngine {
  public tick(deltaMs: number, state: GameState): StatePatch | null {
    try {
      const deltaMin = deltaMs / 60000;
      const currentRegion = regionsData.find((r) => r.id === state.currentRegionId);
      const regionWageMult = currentRegion?.perks.wagesMult ?? 1.0;

      // Calculate total building maintenance
      let totalMaintenance = 0;
      let totalPassiveIncome = 0;

      for (const inst of Object.values(state.buildings)) {
        const def = buildingsData.find((b) => b.id === inst.defId);
        if (!def) continue;

        if (def.baseMaintenancePerMinute > 0) {
          totalMaintenance += calculateMaintenancePerMinute(def.baseMaintenancePerMinute, inst.level) * deltaMin;
        }

        // Commercial passive income
        if (def.category === 'commercial' && def.commercialIncomeType === 'passive') {
          totalPassiveIncome += def.baseIncomePerMinute * deltaMin;
        }
      }

      // Calculate total worker wages
      let totalWages = 0;
      for (const worker of Object.values(state.workers)) {
        totalWages += calculateWagePerMinute(worker.profession, worker.skill, regionWageMult) * deltaMin;
      }

      const netIncome = totalPassiveIncome - (totalMaintenance + totalWages);

      return (prevState: GameState) => {
        const newCoins = Math.max(0, prevState.coins + netIncome);
        const addedLifetime = Math.max(0, netIncome);

        return {
          coins: Math.round(newCoins * 100) / 100,
          lifetimeCoins: Math.round((prevState.lifetimeCoins + addedLifetime) * 100) / 100,
        };
      };
    } catch (err) {
      console.error('[EconomyEngine] Error during tick:', err);
      return null;
    }
  }
}
