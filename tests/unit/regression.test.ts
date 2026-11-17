import { describe, it, expect } from 'vitest';
import buildingsData from '../../src/data/buildings.json';
import questsData from '../../src/data/quests.json';
import { calculateOfflineAccrual } from '../../src/engine/formulas/offline';
import { calculateMiningRates } from '../../src/engine/formulas/mining';
import { revertSupplyDemand } from '../../src/engine/formulas/market';
import { PrestigeEngine } from '../../src/engine/engines/PrestigeEngine';
import { createInitialState } from '../../src/store/gameStore';

describe('Regression Suite (6 tests: T-REG-001 to T-REG-006)', () => {
  it('T-REG-001: Peasant house tax base is exactly 0.30 per minute', () => {
    const peasantHouse = buildingsData.find((b) => b.id === 'bld.res.peasant_house');
    expect(peasantHouse).toBeDefined();
    expect(peasantHouse?.taxBasePerMinute).toBe(0.30);
  });

  it('T-REG-002: Exactly 36 quests exist in data/quests.json and Chapter 10 is linear', () => {
    expect(questsData.length).toBe(36);

    const ch10Quests = questsData.filter((q) => q.chapter === 10);
    expect(ch10Quests.length).toBe(4);

    const q1 = ch10Quests.find((q) => q.questId === 'qst.ch10.001');
    const q2 = ch10Quests.find((q) => q.questId === 'qst.ch10.002');
    const q3 = ch10Quests.find((q) => q.questId === 'qst.ch10.003');
    const q4 = ch10Quests.find((q) => q.questId === 'qst.ch10.004');

    expect(q1).toBeDefined();
    expect(q2?.prerequisites).toContain('qst.ch10.001');
    expect(q3?.prerequisites).toContain('qst.ch10.002');
    expect(q4?.prerequisites).toContain('qst.ch10.003');
  });

  it('T-REG-003: Offline accrual for 24h at 100/min is exactly 86,400 coins (not 144,000)', () => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const now = 2_000_000_000;
    const lastSaved = now - TWENTY_FOUR_HOURS;

    // 100/min * 1440 min * 0.60 efficiency = 86,400 (not 144,000 without efficiency factor)
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

    expect(result.offlineCoinsGranted).toBe(86400);
    expect(result.offlineCoinsGranted).not.toBe(144000);
  });

  it('T-REG-004: Market mean reversion applies per-minute rate, preventing instant swings', () => {
    const equilibrium = 100;
    const current = 150; // High supply or demand

    // For 1 minute reversion (factor 0.02): 150 + (100 - 150) * 0.02 = 149
    const reverted = revertSupplyDemand(current, equilibrium, 0.02);
    expect(reverted).toBe(149);
    expect(reverted).toBeLessThan(current);
    expect(reverted).toBeGreaterThan(equilibrium);
  });

  it('T-REG-005: Mining deposit extraction rate stabilizes at equilibrium and never drops to 0', () => {
    // When remaining deposit is at 0, extraction factor is 0.10 and replenishment is 0.50
    const zeroRates = calculateMiningRates(4, 1, 0, 0, 0, 10000);
    expect(zeroRates.extractionPerMinute).toBeGreaterThan(0);
    expect(zeroRates.replenishmentPerMinute).toBeGreaterThan(zeroRates.extractionPerMinute);
    // Net change is positive, replenishing back up to equilibrium
    expect(zeroRates.netChangePerMinute).toBeGreaterThan(0);

    // When deposit is at 20% (2000 / 10000):
    // depositFactor = 2000 / 5000 = 0.40 -> extraction = 4 * 0.40 = 1.6
    // replenishment = 4 * 0.5 * (1 - 0.20) = 1.6
    // Net change is 0 (equilibrium!)
    const eqRates = calculateMiningRates(4, 1, 0, 0, 2000, 10000);
    expect(eqRates.netChangePerMinute).toBeCloseTo(0, 4);
  });

  it('T-REG-006: Prestige keeps firstTimeBuildXpGranted array so XP cannot be re-farmed', () => {
    const state = createInitialState();
    state.realmTier = 8;
    state.lifetimeCoins = 20_000_000;
    state.firstTimeBuildXpGranted = ['bld.res.wooden_hut', 'bld.ind.woodcutter_camp'];

    const prestigedState = PrestigeEngine.executePrestige(state);

    expect(prestigedState.firstTimeBuildXpGranted).toContain('bld.res.wooden_hut');
    expect(prestigedState.firstTimeBuildXpGranted).toContain('bld.ind.woodcutter_camp');
    expect(prestigedState.firstTimeBuildXpGranted.length).toBe(2);
  });
});
