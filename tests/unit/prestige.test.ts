import { describe, it, expect, beforeEach } from 'vitest';
import { PrestigeEngine } from '../../src/engine/engines/PrestigeEngine';
import { createInitialState } from '../../src/store/gameStore';
import { GameState } from '../../src/engine/types/state';

describe('Prestige & Rebirth Engine (7 tests)', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialState();
  });

  it('T-UNIT-PRS-001: Prestige is locked before Tier 8 or 10M lifetime coins', () => {
    state.realmTier = 7;
    state.lifetimeCoins = 50_000_000;
    expect(PrestigeEngine.canPrestige(state)).toBe(false);
    expect(() => PrestigeEngine.executePrestige(state)).toThrow();

    state.realmTier = 8;
    state.lifetimeCoins = 9_999_999;
    expect(PrestigeEngine.canPrestige(state)).toBe(false);
    expect(() => PrestigeEngine.executePrestige(state)).toThrow();

    state.realmTier = 8;
    state.lifetimeCoins = 10_000_000;
    expect(PrestigeEngine.canPrestige(state)).toBe(true);
  });

  it('T-UNIT-PRS-002: Dynasty Seals formula: floor(sqrt(lifetimeCoins / 10M))', () => {
    expect(PrestigeEngine.getSealsToGrant(9_999_999)).toBe(0);
    expect(PrestigeEngine.getSealsToGrant(10_000_000)).toBe(1);
    expect(PrestigeEngine.getSealsToGrant(40_000_000)).toBe(2);
    expect(PrestigeEngine.getSealsToGrant(90_000_000)).toBe(3);
    expect(PrestigeEngine.getSealsToGrant(100_000_000)).toBe(3);
    expect(PrestigeEngine.getSealsToGrant(1_000_000_000)).toBe(10);
  });

  it('T-UNIT-PRS-003: Prestige reset resets coins, buildings, population, inventory, land', () => {
    state.realmTier = 8;
    state.lifetimeCoins = 40_000_000;
    state.coins = 5_000_000;
    state.buildings['b1'] = {
      instanceId: 'b1',
      defId: 'bld.agri.wheat_field',
      level: 10,
      condition: 100,
      assignedWorkerIds: ['w1'],
      createdAt: 1000,
    };
    state.inventory['item.raw.wheat'] = 5000;
    state.population.current = 150;
    state.ownedPlots = 12;

    const next = PrestigeEngine.executePrestige(state);

    expect(next.realmTier).toBe(1);
    expect(next.coins).toBe(150);
    expect(Object.keys(next.buildings).length).toBe(0);
    expect(Object.keys(next.inventory).length).toBe(0);
    expect(next.population.current).toBe(5);
    expect(next.ownedPlots).toBe(1);
  });

  it('T-UNIT-PRS-004: Prestige keeps achievements, stats, dynastySeals, lifetimeSeals, and legacyTree', () => {
    state.realmTier = 8;
    state.lifetimeCoins = 40_000_000; // grants 2 seals
    state.achievements.unlockedIds = ['ach.first_harvest', 'ach.dynasty_begins'];
    state.stats.relicFragments = 12;
    state.prestige.dynastySeals = 5;
    state.prestige.lifetimeSeals = 5;
    state.prestige.prestigeCount = 1;
    state.prestige.legacyTree = { 'leg.prod_speed': 2 };

    const next = PrestigeEngine.executePrestige(state);

    expect(next.achievements.unlockedIds).toEqual(['ach.first_harvest', 'ach.dynasty_begins']);
    expect(next.stats.relicFragments).toBe(12);
    expect(next.prestige.dynastySeals).toBe(7); // 5 + 2
    expect(next.prestige.lifetimeSeals).toBe(7); // 5 + 2
    expect(next.prestige.prestigeCount).toBe(2);
    expect(next.prestige.legacyTree).toEqual({ 'leg.prod_speed': 2 });
  });

  it('T-UNIT-PRS-005: First-time-build XP is preserved so players cannot re-farm first-time XP on reset', () => {
    state.realmTier = 8;
    state.lifetimeCoins = 20_000_000;
    state.firstTimeBuildXpGranted = ['bld.res.wooden_hut', 'bld.agri.wheat_field'];

    const next = PrestigeEngine.executePrestige(state);

    expect(next.firstTimeBuildXpGranted).toContain('bld.res.wooden_hut');
    expect(next.firstTimeBuildXpGranted).toContain('bld.agri.wheat_field');
  });

  it('T-UNIT-PRS-006: Legacy node rank caps at 5 and throws if maxed', () => {
    state.prestige.dynastySeals = 100;
    state.prestige.legacyTree = { 'leg.prod_speed': 4 };

    // Upgrade rank 4 -> 5 (costs 8 seals)
    const rank5State = PrestigeEngine.upgradeLegacyNode(state, 'leg.prod_speed');
    expect(rank5State.prestige.legacyTree['leg.prod_speed']).toBe(5);
    expect(rank5State.prestige.dynastySeals).toBe(92); // 100 - 8

    // Attempt to upgrade rank 5 -> 6 should throw
    expect(() => PrestigeEngine.upgradeLegacyNode(rank5State, 'leg.prod_speed')).toThrow(/max rank 5/);
  });

  it('T-UNIT-PRS-007: Legacy rank costs scale [1, 2, 3, 5, 8] and fail if insufficient seals', () => {
    state.prestige.dynastySeals = 0;
    expect(() => PrestigeEngine.upgradeLegacyNode(state, 'leg.tax_yield')).toThrow(/Insufficient Dynasty Seals/);

    state.prestige.dynastySeals = 1;
    const r1 = PrestigeEngine.upgradeLegacyNode(state, 'leg.tax_yield');
    expect(r1.prestige.legacyTree['leg.tax_yield']).toBe(1);
    expect(r1.prestige.dynastySeals).toBe(0);

    // Rank 1 -> 2 needs 2 seals
    state = r1;
    state.prestige.dynastySeals = 1;
    expect(() => PrestigeEngine.upgradeLegacyNode(state, 'leg.tax_yield')).toThrow(/Insufficient Dynasty Seals/);

    state.prestige.dynastySeals = 2;
    const r2 = PrestigeEngine.upgradeLegacyNode(state, 'leg.tax_yield');
    expect(r2.prestige.legacyTree['leg.tax_yield']).toBe(2);
    expect(r2.prestige.dynastySeals).toBe(0);
  });
});
