import { describe, it, expect } from 'vitest';
import { calculateOfflineAccrual } from '../../src/engine/formulas/offline';
import { OfflineEngine } from '../../src/engine/engines/OfflineEngine';
import { createInitialState } from '../../src/store/gameStore';
import { OFFLINE_CAP_MS, SEASON_LENGTH_MS } from '../../src/engine/constants';

describe('Offline Accrual Engine (8 tests)', () => {
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

  it('T-UNIT-OFF-001: 1 hour offline accrual at 100/min production and 60% efficiency', () => {
    const now = 1_000_000_000;
    const lastSaved = now - ONE_HOUR_MS;
    // 100/min * 60 min * 0.60 = 3,600 coins
    const result = calculateOfflineAccrual(
      lastSaved,
      now,
      100, // production per min
      0,   // tax per min
      0,   // current vault
      100_000, // vault cap
      0,
      10_000
    );

    expect(result.elapsedMinutes).toBe(60);
    expect(result.offlineCoinsGranted).toBe(3600);
  });

  it('T-UNIT-OFF-002: 24 hours offline accrual at 100/min = exactly 86,400 coins', () => {
    const now = 1_000_000_000;
    const lastSaved = now - TWENTY_FOUR_HOURS_MS;
    // 100/min * 1440 min * 0.60 = 86,400 coins
    const result = calculateOfflineAccrual(
      lastSaved,
      now,
      100,
      0,
      0,
      1_000_000,
      0,
      10_000
    );

    expect(result.elapsedMs).toBe(TWENTY_FOUR_HOURS_MS);
    expect(result.elapsedMinutes).toBe(1440);
    expect(result.offlineCoinsGranted).toBe(86400);
  });

  it('T-UNIT-OFF-003: 48 hours offline is capped strictly at 24 hours (86,400,000 ms)', () => {
    const now = 1_000_000_000;
    const lastSaved = now - FORTY_EIGHT_HOURS_MS;
    const result = calculateOfflineAccrual(
      lastSaved,
      now,
      100,
      0,
      0,
      1_000_000,
      0,
      10_000
    );

    expect(result.elapsedMs).toBe(OFFLINE_CAP_MS);
    expect(result.elapsedMinutes).toBe(1440);
    expect(result.offlineCoinsGranted).toBe(86400);
  });

  it('T-UNIT-OFF-004: Clock rollback detected when currentTime < lastSavedAt -> grants 0', () => {
    const now = 1_000_000_000;
    const lastSaved = now + 60_000; // future time
    const result = calculateOfflineAccrual(
      lastSaved,
      now,
      100,
      50,
      0,
      10_000,
      0,
      10_000
    );

    expect(result.elapsedMs).toBe(0);
    expect(result.offlineCoinsGranted).toBe(0);
    expect(result.offlineTreasuryGranted).toBe(0);
    expect(result.flag).toBe('clock_rollback');
  });

  it('T-UNIT-OFF-005: Vault capacity capping limits offline coin accrual', () => {
    const now = 1_000_000_000;
    const lastSaved = now - TWENTY_FOUR_HOURS_MS;
    // Produces 86,400, but vault has capacity 50,000 and current is 45,000 -> space = 5,000
    const result = calculateOfflineAccrual(
      lastSaved,
      now,
      100,
      0,
      45_000,
      50_000,
      0,
      10_000
    );

    expect(result.offlineCoinsGranted).toBe(5000);
  });

  it('T-UNIT-OFF-006: Treasury capacity capping limits offline tax accrual', () => {
    const now = 1_000_000_000;
    const lastSaved = now - ONE_HOUR_MS;
    // 50 tax/min * 60 min * 0.60 = 1,800 tax. Treasury cap is 2,000, current is 1,500 -> space = 500
    const result = calculateOfflineAccrual(
      lastSaved,
      now,
      0,
      50,
      0,
      100_000,
      1500,
      2000
    );

    expect(result.offlineTreasuryGranted).toBe(500);
  });

  it('T-UNIT-OFF-007: Seasonal advance correctly increments seasons elapsed during offline', () => {
    const now = 1_000_000_000;
    // Offline for 1 full season (24h)
    const lastSaved = now - SEASON_LENGTH_MS;
    const result = calculateOfflineAccrual(
      lastSaved,
      now,
      0,
      0,
      0,
      100_000,
      0,
      10_000
    );

    expect(result.seasonsElapsed).toBe(1);
  });

  it('T-UNIT-OFF-008: OfflineEngine executes on first tick only and returns null thereafter', () => {
    const engine = new OfflineEngine();
    const state = createInitialState();
    state.updatedAt = Date.now() - ONE_HOUR_MS;

    const patch1 = engine.tick(1000, state);
    expect(patch1).not.toBeNull();
    expect(typeof patch1).toBe('function');

    const patch2 = engine.tick(1000, state);
    expect(patch2).toBeNull();

    // Resetting enables it again
    engine.reset();
    const patch3 = engine.tick(1000, state);
    expect(patch3).not.toBeNull();
  });
});
