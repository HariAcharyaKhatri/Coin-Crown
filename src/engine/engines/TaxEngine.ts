import { GameState, StatePatch } from '../types/state';
import {
  calculateTaxIncomePerMinute,
  calculateSatisfactionTarget,
  updateSatisfaction,
  calculateGuardReduction,
  calculateUnrestTarget,
  updateUnrest,
} from '../formulas/taxation';
import buildingsData from '../../data/buildings.json';
import regionsData from '../../data/regions.json';

export class TaxEngine {
  public tick(deltaMs: number, state: GameState): StatePatch | null {
    try {
      const deltaMin = deltaMs / 60000;

      // Count civic structures
      let churches = 0;
      let universities = 0;
      let hasTaxOffice = false;
      let hasTownHall = false;
      let hasTreasury = false;
      let hasBarracks = false;
      let totalTaxBase = 0;

      for (const inst of Object.values(state.buildings)) {
        const def = buildingsData.find((b) => b.id === inst.defId);
        if (!def) continue;

        if (def.id === 'bld.roy.church') churches++;
        if (def.id === 'bld.roy.university') universities++;
        if (def.id === 'bld.roy.tax_office') hasTaxOffice = true;
        if (def.id === 'bld.roy.town_hall') hasTownHall = true;
        if (def.id === 'bld.roy.treasury') hasTreasury = true;
        if (def.id === 'bld.roy.barracks') hasBarracks = true;

        if (def.taxBasePerMinute > 0) {
          totalTaxBase += def.taxBasePerMinute * (inst.condition / 100);
        }
      }

      // Region bonus
      const currentRegion = regionsData.find((r) => r.id === state.currentRegionId);
      const regionTaxBonus = (currentRegion?.perks.taxMult ?? 1.0) - 1.0;

      // Tax efficiency
      const taxEfficiency =
        1.0 +
        (hasTaxOffice ? 0.10 : 0) +
        (hasTownHall ? 0.05 : 0) +
        (hasTreasury ? 0.05 : 0) +
        regionTaxBonus;

      const taxRate = state.population.taxRate;
      const accruedTax = calculateTaxIncomePerMinute(totalTaxBase, taxRate, taxEfficiency) * deltaMin;

      // Satisfaction target & convergence
      const housingShortagePenalty = Math.max(0, state.population.homeless * 2);
      const targetSatisfaction = calculateSatisfactionTarget(
        taxRate,
        churches,
        universities,
        housingShortagePenalty
      );
      const newSatisfaction = updateSatisfaction(
        state.population.satisfaction,
        targetSatisfaction,
        deltaMs
      );

      // Guards & unrest
      const guardReduction = calculateGuardReduction(
        state.population.guards,
        1,
        hasBarracks
      );
      const targetUnrest = calculateUnrestTarget(taxRate, guardReduction);
      const newUnrest = updateUnrest(state.population.unrest, targetUnrest, deltaMs);

      return (prevState: GameState) => {
        const newBalance = Math.min(
          prevState.treasury.cap,
          prevState.treasury.balance + accruedTax
        );

        return {
          treasury: {
            ...prevState.treasury,
            balance: Math.round(newBalance * 100) / 100,
            lifetimeTaxCollected: prevState.treasury.lifetimeTaxCollected + accruedTax,
          },
          population: {
            ...prevState.population,
            satisfaction: Math.round(newSatisfaction * 100) / 100,
            unrest: Math.round(newUnrest * 100) / 100,
          },
        };
      };
    } catch (err) {
      console.error('[TaxEngine] Error during tick:', err);
      return null;
    }
  }
}
