import { describe, it, expect } from 'vitest';
import {
  calculateBuildingOutputPerMinute,
  calculateWorkerSkillBonus,
  calculateUpgradeCost,
  calculateMaintenancePerMinute,
  calculateDemolitionRefund,
  calculateClickPower,
} from '../../src/engine/formulas/production';
import {
  calculateTaxSatisfactionMultiplier,
  calculateTaxIncomePerMinute,
  calculateSatisfactionTarget,
  calculateGuardReduction,
  calculateUnrestTarget,
  calculateUnrestPenalty,
} from '../../src/engine/formulas/taxation';
import { calculateMiningRates } from '../../src/engine/formulas/mining';
import { calculateOfflineAccrual } from '../../src/engine/formulas/offline';
import {
  calculateXpToNextLevel,
  calculateFirstTimeBuildXp,
  calculatePrestigeSeals,
} from '../../src/engine/formulas/progression';
import { calculateMarketPrice } from '../../src/engine/formulas/market';

describe('Unit Formulas (35 Cases)', () => {
  // 1-15: Production & Click
  it('T-UNIT-PROD-001: wheat_field L1 = 4 wheat/min', () => {
    const output = calculateBuildingOutputPerMinute(4, 1, 0, 0, 'spring');
    expect(output).toBe(4);
  });

  it('T-UNIT-PROD-002: wheat_field L10 = 4 * 1.45^9 = ~113.34 wheat/min (canonical 4 * 1.45^9)', () => {
    const output = calculateBuildingOutputPerMinute(4, 10, 0, 0, 'spring');
    expect(output).toBeCloseTo(4 * Math.pow(1.45, 9), 2);
  });

  it('T-UNIT-PROD-003: summer season multiplier is 1.15', () => {
    const output = calculateBuildingOutputPerMinute(10, 1, 0, 0, 'summer');
    expect(output).toBeCloseTo(11.5, 2);
  });

  it('T-UNIT-PROD-004: autumn season multiplier is 1.30', () => {
    const output = calculateBuildingOutputPerMinute(10, 1, 0, 0, 'autumn');
    expect(output).toBeCloseTo(13.0, 2);
  });

  it('T-UNIT-PROD-005: winter season multiplier is 0.45', () => {
    const output = calculateBuildingOutputPerMinute(10, 1, 0, 0, 'winter');
    expect(output).toBeCloseTo(4.5, 2);
  });

  it('T-UNIT-PROD-006: spring season multiplier is 1.00', () => {
    const output = calculateBuildingOutputPerMinute(10, 1, 0, 0, 'spring');
    expect(output).toBe(10);
  });

  it('T-UNIT-PROD-007: worker skill bonus caps at 0.16', () => {
    const bonus = calculateWorkerSkillBonus(10);
    expect(bonus).toBe(0.16);
  });

  it('T-UNIT-PROD-008: worker skill 1 gives 0 bonus', () => {
    const bonus = calculateWorkerSkillBonus(1);
    expect(bonus).toBe(0);
  });

  it('T-UNIT-PROD-009: worker skill 3 gives 0.08 bonus', () => {
    const bonus = calculateWorkerSkillBonus(3);
    expect(bonus).toBeCloseTo(0.08, 4);
  });

  it('T-UNIT-PROD-010: upgrade cost L1 to L2 = round(purchaseCost * 1.60^1)', () => {
    const cost = calculateUpgradeCost(100, 2);
    expect(cost).toBe(160);
  });

  it('T-UNIT-PROD-011: upgrade cost L1 to L5', () => {
    const cost = calculateUpgradeCost(50, 5);
    expect(cost).toBe(Math.round(50 * Math.pow(1.6, 4)));
  });

  it('T-UNIT-PROD-012: maintenance per min formula', () => {
    const maint = calculateMaintenancePerMinute(10, 5);
    expect(maint).toBe(10 * (1 + 5 * 0.04));
  });

  it('T-UNIT-PROD-013: demolition refund is 50% of purchaseCost', () => {
    const refund = calculateDemolitionRefund(500);
    expect(refund).toBe(250);
  });

  it('T-UNIT-PROD-014: click power L1 = 1 * (1 + 0.5 * 1) = 1.5', () => {
    const power = calculateClickPower(1);
    expect(power).toBe(1.5);
  });

  it('T-UNIT-PROD-015: click power L10 = 1 * (1 + 0.5 * 10) = 6.0', () => {
    const power = calculateClickPower(10);
    expect(power).toBe(6.0);
  });

  // 16-22: Taxation & Demographics
  it('T-UNIT-TAX-001: 10 peasant houses @ 0.15 = 0.45 coin/min', () => {
    const totalTaxBase = 10 * 0.30; // 3.0
    const income = calculateTaxIncomePerMinute(totalTaxBase, 0.15, 1.0);
    expect(income).toBeCloseTo(0.45, 2);
  });

  it('T-UNIT-TAX-002: tax satisfaction multiplier at 0.15 is 1.0', () => {
    const mult = calculateTaxSatisfactionMultiplier(0.15);
    expect(mult).toBe(1.0);
  });

  it('T-UNIT-TAX-003: tax rate 0.00 -> satisfactionMult = 1.15 (clamped)', () => {
    const mult = calculateTaxSatisfactionMultiplier(0.00);
    expect(mult).toBe(1.15);
  });

  it('T-UNIT-TAX-004: tax rate 0.50 -> satisfactionMult = 0.58', () => {
    const mult = calculateTaxSatisfactionMultiplier(0.50);
    expect(mult).toBeCloseTo(0.58, 2);
  });

  it('T-UNIT-TAX-005: satisfaction target converges toward formula', () => {
    const target = calculateSatisfactionTarget(0.15, 1, 0, 0);
    expect(target).toBe(70 + 8);
  });

  it('T-UNIT-TAX-006: guard reduction reduces unrest target', () => {
    const reduction = calculateGuardReduction(10, 1, false);
    const unrestTarget = calculateUnrestTarget(0.30, reduction);
    expect(reduction).toBeCloseTo(3.15, 2);
    expect(unrestTarget).toBeCloseTo((0.30 - 0.20) * 200 - 3.15, 2);
  });

  it('T-UNIT-TAX-007: unrest penalty thresholds (0, 0.10, 0.20, 0.35)', () => {
    expect(calculateUnrestPenalty(20)).toBe(0);
    expect(calculateUnrestPenalty(35)).toBe(0.10);
    expect(calculateUnrestPenalty(65)).toBe(0.20);
    expect(calculateUnrestPenalty(85)).toBe(0.35);
  });

  // 23-25: Mining Equilibrium
  it('T-UNIT-MINING-001: deposit stabilizes at 20% (never 0)', () => {
    const depositMax = 20000;
    const ratesAtEquilibrium = calculateMiningRates(4, 1, 0, 0, depositMax * 0.20, depositMax);
    expect(ratesAtEquilibrium.netChangePerMinute).toBeCloseTo(0, 4);
    expect(ratesAtEquilibrium.extractionPerMinute).toBeCloseTo(ratesAtEquilibrium.replenishmentPerMinute, 4);
  });

  it('T-UNIT-MINING-002: extraction rate when deposit is at 50%', () => {
    const rates = calculateMiningRates(10, 1, 0, 0, 10000, 20000);
    expect(rates.extractionPerMinute).toBe(10);
  });

  it('T-UNIT-MINING-003: replenishment rate when deposit is at 0%', () => {
    const rates = calculateMiningRates(10, 1, 0, 0, 0, 20000);
    expect(rates.replenishmentPerMinute).toBe(5);
  });

  // 26-29: Offline Accrual
  it('T-UNIT-OFFLINE-001: 100/min * 24h * 0.60 = 86,400 coins', () => {
    const now = 1_000_000_000;
    const saved = now - 86_400_000; // 24h ago
    const res = calculateOfflineAccrual(saved, now, 100, 0, 0, 1_000_000, 0, 1_000_000);
    expect(res.offlineCoinsGranted).toBe(86400);
  });

  it('T-UNIT-OFFLINE-002: clock rollback -> 0 coins', () => {
    const now = 1_000_000_000;
    const saved = now + 60_000; // future
    const res = calculateOfflineAccrual(saved, now, 100, 0, 0, 1_000_000, 0, 1_000_000);
    expect(res.offlineCoinsGranted).toBe(0);
    expect(res.flag).toBe('clock_rollback');
  });

  it('T-UNIT-OFFLINE-003: offline accrual capped at 24 hours', () => {
    const now = 1_000_000_000;
    const saved = now - 172_800_000; // 48h ago
    const res = calculateOfflineAccrual(saved, now, 100, 0, 0, 1_000_000, 0, 1_000_000);
    expect(res.offlineCoinsGranted).toBe(86400); // capped at 24h
  });

  it('T-UNIT-OFFLINE-004: offline accrual respects vault capacity', () => {
    const now = 1_000_000_000;
    const saved = now - 86_400_000;
    const res = calculateOfflineAccrual(saved, now, 100, 0, 0, 5000, 0, 1_000_000);
    expect(res.offlineCoinsGranted).toBe(5000);
  });

  // 30-32: XP and Progression
  it('T-UNIT-XP-001: L50 -> next requires 9,564 XP', () => {
    expect(calculateXpToNextLevel(50)).toBe(9564);
  });

  it('T-UNIT-XP-002: L1 -> next requires 40 XP', () => {
    expect(calculateXpToNextLevel(1)).toBe(40);
  });

  it('T-UNIT-XP-003: first-time-build XP calculation', () => {
    expect(calculateFirstTimeBuildXp(1)).toBe(10);
    expect(calculateFirstTimeBuildXp(5)).toBe(50);
  });

  // 33-34: Prestige
  it('T-UNIT-PRESTIGE-001: 50M lifetime -> 2 seals', () => {
    expect(calculatePrestigeSeals(50_000_000)).toBe(2);
  });

  it('T-UNIT-PRESTIGE-002: 1B lifetime -> 10 seals', () => {
    expect(calculatePrestigeSeals(1_000_000_000)).toBe(10);
  });

  // 35: Market
  it('T-UNIT-MARKET-001: price clamped between 0.5*base and 2.0*base', () => {
    const minPrice = calculateMarketPrice(10, 1000, 1);
    const maxPrice = calculateMarketPrice(10, 1, 1000);
    expect(minPrice).toBe(5);
    expect(maxPrice).toBe(20);
  });
});
