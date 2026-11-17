import { GameState, StatePatch } from '../types/state';
import { calculateOfflineAccrual } from '../formulas/offline';
import { calculateBuildingOutputPerMinute } from '../formulas/production';
import { calculateTaxIncomePerMinute } from '../formulas/taxation';
import buildingsData from '../../data/buildings.json';
import { EventBus } from '../events/EventBus';

export class OfflineEngine {
  private hasProcessedFirstTick = false;

  public tick(_deltaMs: number, state: GameState): StatePatch | null {
    if (this.hasProcessedFirstTick) {
      return null;
    }
    this.hasProcessedFirstTick = true;

    try {
      const now = Date.now();
      const lastSavedAt = state.updatedAt || now;

      // Calculate total production per minute
      let totalProdPerMin = 0;
      for (const instance of Object.values(state.buildings)) {
        const def = buildingsData.find((b) => b.id === instance.defId);
        if (!def || def.baseOutput.length === 0) continue;
        const baseQty = def.baseOutput.reduce((acc, o) => acc + o.amountPerMinute, 0);
        totalProdPerMin += calculateBuildingOutputPerMinute(
          baseQty,
          instance.level,
          0,
          0,
          state.season.currentSeason
        );
      }

      // Calculate base tax income per minute
      let totalTaxBase = 0;
      for (const instance of Object.values(state.buildings)) {
        const def = buildingsData.find((b) => b.id === instance.defId);
        if (def && def.taxBasePerMinute > 0) {
          totalTaxBase += def.taxBasePerMinute * (instance.condition / 100);
        }
      }
      const taxIncomePerMin = calculateTaxIncomePerMinute(totalTaxBase, state.population.taxRate);

      const result = calculateOfflineAccrual(
        lastSavedAt,
        now,
        totalProdPerMin,
        taxIncomePerMin,
        state.vault,
        state.vaultCapacity,
        state.treasury.balance,
        state.treasury.cap
      );

      if (result.offlineCoinsGranted > 0 || result.offlineTreasuryGranted > 0) {
        EventBus.emit('COINS_CHANGED', {
          reason: 'offline_accrual',
          vaultCoins: result.offlineCoinsGranted,
          treasuryCoins: result.offlineTreasuryGranted,
        });
      }

      return (prevState: GameState) => ({
        vault: prevState.vault + result.offlineCoinsGranted,
        treasury: {
          ...prevState.treasury,
          balance: prevState.treasury.balance + result.offlineTreasuryGranted,
        },
        season: {
          ...prevState.season,
          totalSeasonsElapsed: prevState.season.totalSeasonsElapsed + result.seasonsElapsed,
        },
      });
    } catch (err) {
      console.error('[OfflineEngine] Error during offline accrual:', err);
      return null;
    }
  }

  public reset(): void {
    this.hasProcessedFirstTick = false;
  }
}
