import { GameState, StatePatch, BuildingInstance } from '../types/state';
import { calculateConditionDecay, calculateRent } from '../formulas/population';
import buildingsData from '../../data/buildings.json';

export class PropertyEngine {
  public tick(deltaMs: number, state: GameState): StatePatch | null {
    try {
      const updatedBuildings: Record<string, BuildingInstance> = {};
      let totalRentIncome = 0;
      const deltaMin = deltaMs / 60000;

      for (const [id, inst] of Object.entries(state.buildings)) {
        const def = buildingsData.find((b) => b.id === inst.defId);
        const newCondition = calculateConditionDecay(inst.condition, deltaMs);

        let income = 0;
        if (def && def.baseIncomePerMinute > 0) {
          income = calculateRent(def.baseIncomePerMinute, inst.level, newCondition) * deltaMin;
          totalRentIncome += income;
        }

        updatedBuildings[id] = {
          ...inst,
          condition: Math.round(newCondition * 1000) / 1000,
        };
      }

      return (prevState: GameState) => ({
        buildings: updatedBuildings,
        coins: prevState.coins + totalRentIncome,
        lifetimeCoins: prevState.lifetimeCoins + totalRentIncome,
      });
    } catch (err) {
      console.error('[PropertyEngine] Error during tick:', err);
      return null;
    }
  }
}
