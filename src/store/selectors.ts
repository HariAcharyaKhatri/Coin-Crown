import { GameState } from '../engine/types/state';
import buildingsData from '../data/buildings.json';
import itemsData from '../data/items.json';
import { calculateBuildingOutputPerMinute } from '../engine/formulas/production';
import { calculateMaintenancePerMinute } from '../engine/formulas/production';
import { calculateWagePerMinute } from '../engine/formulas/population';

export function selectNetIncomePerMinute(state: GameState): {
  grossIncomePerMin: number;
  maintenancePerMin: number;
  wagesPerMin: number;
  netIncomePerMin: number;
} {
  let grossIncome = 0;
  let maintenance = 0;

  for (const inst of Object.values(state.buildings)) {
    const def = buildingsData.find((b) => b.id === inst.defId);
    if (!def) continue;

    if (def.baseIncomePerMinute > 0) {
      grossIncome += def.baseIncomePerMinute * (inst.condition / 100);
    }
    if (def.baseMaintenancePerMinute > 0) {
      maintenance += calculateMaintenancePerMinute(def.baseMaintenancePerMinute, inst.level);
    }
  }

  let wages = 0;
  for (const w of Object.values(state.workers)) {
    wages += calculateWagePerMinute(w.profession, w.skill);
  }

  return {
    grossIncomePerMin: Math.round(grossIncome * 100) / 100,
    maintenancePerMin: Math.round(maintenance * 100) / 100,
    wagesPerMin: Math.round(wages * 100) / 100,
    netIncomePerMin: Math.round((grossIncome - (maintenance + wages)) * 100) / 100,
  };
}

export function selectTotalProductionPerMinute(state: GameState): number {
  let total = 0;
  for (const inst of Object.values(state.buildings)) {
    const def = buildingsData.find((b) => b.id === inst.defId);
    if (!def) continue;
    for (const out of def.baseOutput) {
      total += calculateBuildingOutputPerMinute(
        out.amountPerMinute,
        inst.level,
        0,
        0,
        state.season.currentSeason
      );
    }
  }
  return Math.round(total * 100) / 100;
}

export function selectStorageUsage(state: GameState): Record<string, { used: number; max: number }> {
  const usage: Record<string, { used: number; max: number }> = {
    bulk: { used: 0, max: state.storageCapacities.bulk },
    standard: { used: 0, max: state.storageCapacities.standard },
    perishable: { used: 0, max: state.storageCapacities.perishable },
    precious: { used: 0, max: state.storageCapacities.precious },
  };

  for (const [itemId, qty] of Object.entries(state.inventory)) {
    const item = itemsData.find((i) => i.id === itemId);
    if (item && usage[item.storageClass]) {
      usage[item.storageClass].used += qty;
    }
  }

  return usage;
}
