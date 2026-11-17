import { OFFLINE_CAP_MS, OFFLINE_EFFICIENCY, SEASON_LENGTH_MS } from '../constants';

export interface OfflineAccrualResult {
  elapsedMs: number;
  elapsedMinutes: number;
  offlineCoinsGranted: number;
  offlineTreasuryGranted: number;
  seasonsElapsed: number;
  flag?: 'clock_rollback';
}

export function calculateOfflineAccrual(
  lastSavedAt: number,
  currentTime: number,
  productionPerMin: number,
  taxIncomePerMin: number,
  currentVault: number,
  vaultCapacity: number,
  currentTreasury: number,
  treasuryCap: number
): OfflineAccrualResult {
  const diff = currentTime - lastSavedAt;
  if (diff < 0) {
    return {
      elapsedMs: 0,
      elapsedMinutes: 0,
      offlineCoinsGranted: 0,
      offlineTreasuryGranted: 0,
      seasonsElapsed: 0,
      flag: 'clock_rollback',
    };
  }

  const elapsedMs = Math.min(diff, OFFLINE_CAP_MS);
  const elapsedMinutes = elapsedMs / 60_000;

  const offlineCoin = productionPerMin * elapsedMinutes * OFFLINE_EFFICIENCY;
  const availableVaultSpace = Math.max(0, vaultCapacity - currentVault);
  const offlineCoinsGranted = Math.min(offlineCoin, availableVaultSpace);

  const offlineTreasury = taxIncomePerMin * elapsedMinutes * OFFLINE_EFFICIENCY;
  const availableTreasurySpace = Math.max(0, treasuryCap - currentTreasury);
  const offlineTreasuryGranted = Math.min(offlineTreasury, availableTreasurySpace);

  const seasonsElapsed = Math.floor(elapsedMs / SEASON_LENGTH_MS);

  return {
    elapsedMs,
    elapsedMinutes,
    offlineCoinsGranted,
    offlineTreasuryGranted,
    seasonsElapsed,
  };
}
