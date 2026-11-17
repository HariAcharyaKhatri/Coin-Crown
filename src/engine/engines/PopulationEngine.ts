import { GameState, StatePatch } from '../types/state';
import {
  calculateHousingCapacity,
  calculateTargetPopulation,
  calculatePopulationGrowth,
} from '../formulas/population';
import buildingsData from '../../data/buildings.json';

export class PopulationEngine {
  public tick(deltaMs: number, state: GameState): StatePatch | null {
    try {
      const housingBuildings: { capacity: number; condition: number }[] = [];
      for (const inst of Object.values(state.buildings)) {
        const def = buildingsData.find((b) => b.id === inst.defId);
        if (def && def.housingCapacity > 0) {
          housingBuildings.push({
            capacity: def.housingCapacity,
            condition: inst.condition,
          });
        }
      }

      const capacity = calculateHousingCapacity(housingBuildings);
      const targetPop = calculateTargetPopulation(capacity, state.population.satisfaction);
      const growth = calculatePopulationGrowth(
        state.population.current,
        targetPop,
        state.population.satisfaction,
        state.currentRegionId,
        deltaMs
      );

      const newCurrent = Math.max(0, state.population.current + growth);
      const employedCount = Object.keys(state.workers).length;
      const homelessCount = Math.max(0, Math.floor(newCurrent) - capacity);

      return (prevState: GameState) => ({
        population: {
          ...prevState.population,
          current: Math.round(newCurrent * 100) / 100,
          target: Math.round(targetPop * 100) / 100,
          employed: employedCount,
          homeless: homelessCount,
        },
      });
    } catch (err) {
      console.error('[PopulationEngine] Error during tick:', err);
      return null;
    }
  }
}
