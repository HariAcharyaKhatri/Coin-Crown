import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import { createInitialState } from '../../src/store/gameStore';
import { GameState } from '../../src/engine/types/state';

describe('Integration Actions (20 Cases)', () => {
  let engine: GameEngine;
  let state: GameState;

  beforeEach(() => {
    engine = new GameEngine();
    state = createInitialState();
  });

  it('T-ACT-001: CLICK_COLLECT increments vault/coins and stats', () => {
    const next = engine.dispatch({ type: 'CLICK_COLLECT' }, state);
    expect(next.stats.clickCollectCount).toBe(1);
    expect(next.vault + next.coins).toBeGreaterThan(state.vault + state.coins);
  });

  it('T-ACT-002: EMPTY_VAULT moves vault coins to liquid coins', () => {
    state.vault = 100;
    const initialCoins = state.coins;
    const next = engine.dispatch({ type: 'EMPTY_VAULT' }, state);
    expect(next.vault).toBe(0);
    expect(next.coins).toBe(initialCoins + 100);
  });

  it('T-ACT-003: BUILD creates building, deducts cost, grants first-time-build XP', () => {
    state.coins = 500;
    const initialXp = state.playerXp;
    const next = engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    expect(Object.keys(next.buildings).length).toBe(1);
    expect(next.coins).toBe(450); // 500 - 50
    expect(next.playerXp).toBe(initialXp + 10);
    expect(next.firstTimeBuildXpGranted).toContain('bld.agri.wheat_field');
  });

  it('T-ACT-004: BUILD rejects when coins insufficient', () => {
    state.coins = 10;
    expect(() => {
      engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    }).toThrow(/Insufficient coins/);
  });

  it('T-ACT-005: UPGRADE increases level, deducts calculated cost', () => {
    state.coins = 500;
    let s = engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    const instId = Object.keys(s.buildings)[0];
    s.coins = 500;
    const next = engine.dispatch({ type: 'UPGRADE', instanceId: instId }, s);
    expect(next.buildings[instId].level).toBe(2);
    expect(next.coins).toBe(500 - 80); // 50 * 1.6^1 = 80
  });

  it('T-ACT-006: UPGRADE rejects when building at max level (25)', () => {
    state.coins = 100000;
    let s = engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    const instId = Object.keys(s.buildings)[0];
    s.buildings[instId].level = 25;
    expect(() => {
      engine.dispatch({ type: 'UPGRADE', instanceId: instId }, s);
    }).toThrow(/max level/);
  });

  it('T-ACT-007: DEMOLISH removes building, refunds 50% purchase cost', () => {
    state.coins = 500;
    let s = engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    const instId = Object.keys(s.buildings)[0];
    const coinsBefore = s.coins;
    const next = engine.dispatch({ type: 'DEMOLISH', instanceId: instId }, s);
    expect(next.buildings[instId]).toBeUndefined();
    expect(next.coins).toBe(coinsBefore + 25); // 50 * 0.5 = 25
  });

  it('T-ACT-008: REPAIR_BUILDING restores condition to 100', () => {
    state.coins = 500;
    let s = engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    const instId = Object.keys(s.buildings)[0];
    s.buildings[instId].condition = 50;
    const next = engine.dispatch({ type: 'REPAIR_BUILDING', instanceId: instId }, s);
    expect(next.buildings[instId].condition).toBe(100);
  });

  it('T-ACT-009: BUY_ITEM purchases goods and adds to inventory', () => {
    state.coins = 500;
    const next = engine.dispatch({ type: 'BUY_ITEM', itemId: 'item.raw.wheat', quantity: 10 }, state);
    expect(next.inventory['item.raw.wheat']).toBe(10);
    expect(next.coins).toBeLessThan(500);
  });

  it('T-ACT-010: BUY_ITEM rejects when coins insufficient', () => {
    state.coins = 1;
    expect(() => {
      engine.dispatch({ type: 'BUY_ITEM', itemId: 'item.raw.wheat', quantity: 50 }, state);
    }).toThrow(/Insufficient coins/);
  });

  it('T-ACT-011: SELL_ITEM sells goods at market price, adds revenue', () => {
    state.inventory['item.raw.wheat'] = 20;
    state.trade.marketPrices['item.raw.wheat'] = {
      supply: 20,
      demand: 20,
      equilibriumSupply: 20,
      equilibriumDemand: 20,
      currentPrice: 3,
    };
    const coinsBefore = state.coins;
    const next = engine.dispatch({ type: 'SELL_ITEM', itemId: 'item.raw.wheat', quantity: 10 }, state);
    expect(next.inventory['item.raw.wheat']).toBe(10);
    expect(next.coins).toBe(coinsBefore + 30);
  });

  it('T-ACT-012: SELL_ITEM rejects when quantity insufficient', () => {
    state.inventory['item.raw.wheat'] = 2;
    expect(() => {
      engine.dispatch({ type: 'SELL_ITEM', itemId: 'item.raw.wheat', quantity: 10 }, state);
    }).toThrow(/Insufficient inventory/);
  });

  it('T-ACT-013: HIRE_WORKER creates worker instance, deducts hire cost', () => {
    state.coins = 500;
    const next = engine.dispatch({ type: 'HIRE_WORKER', profession: 'farmer' }, state);
    expect(Object.keys(next.workers).length).toBe(1);
    expect(next.coins).toBe(450); // 500 - 50
  });

  it('T-ACT-014: ASSIGN_WORKER assigns worker to building slot', () => {
    state.coins = 500;
    let s = engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    s = engine.dispatch({ type: 'HIRE_WORKER', profession: 'farmer' }, s);
    const bId = Object.keys(s.buildings)[0];
    const wId = Object.keys(s.workers)[0];

    const next = engine.dispatch({ type: 'ASSIGN_WORKER', workerId: wId, buildingInstanceId: bId }, s);
    expect(next.buildings[bId].assignedWorkerIds).toContain(wId);
    expect(next.workers[wId].assignedBuildingInstanceId).toBe(bId);
  });

  it('T-ACT-015: UNASSIGN_WORKER unassigns worker from building', () => {
    state.coins = 500;
    let s = engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    s = engine.dispatch({ type: 'HIRE_WORKER', profession: 'farmer' }, s);
    const bId = Object.keys(s.buildings)[0];
    const wId = Object.keys(s.workers)[0];
    s = engine.dispatch({ type: 'ASSIGN_WORKER', workerId: wId, buildingInstanceId: bId }, s);

    const next = engine.dispatch({ type: 'UNASSIGN_WORKER', workerId: wId }, s);
    expect(next.buildings[bId].assignedWorkerIds).not.toContain(wId);
    expect(next.workers[wId].assignedBuildingInstanceId).toBeUndefined();
  });

  it('T-ACT-016: HIRE_MANAGER creates manager instance', () => {
    state.coins = 2000;
    const next = engine.dispatch({ type: 'HIRE_MANAGER', specialty: 'agriculture' }, state);
    expect(Object.keys(next.managers).length).toBe(1);
    expect(next.coins).toBe(1500); // 2000 - 500
  });

  it('T-ACT-017: ASSIGN_MANAGER assigns manager to building slot', () => {
    state.coins = 2000;
    let s = engine.dispatch({ type: 'BUILD', defId: 'bld.agri.wheat_field' }, state);
    s = engine.dispatch({ type: 'HIRE_MANAGER', specialty: 'agriculture' }, s);
    const bId = Object.keys(s.buildings)[0];
    const mId = Object.keys(s.managers)[0];

    const next = engine.dispatch({ type: 'ASSIGN_MANAGER', managerId: mId, buildingInstanceId: bId }, s);
    expect(next.buildings[bId].assignedManagerId).toBe(mId);
    expect(next.managers[mId].assignedBuildingInstanceId).toBe(bId);
  });

  it('T-ACT-018: SET_TAX_RATE sets tax rate between 0.00 and 0.50', () => {
    let next = engine.dispatch({ type: 'SET_TAX_RATE', rate: 0.25 }, state);
    expect(next.population.taxRate).toBe(0.25);
    next = engine.dispatch({ type: 'SET_TAX_RATE', rate: 0.85 }, next);
    expect(next.population.taxRate).toBe(0.50); // clamped to 0.50
  });

  it('T-ACT-019: COLLECT_TAX empties treasury into coins', () => {
    state.treasury.balance = 250;
    const initialCoins = state.coins;
    const next = engine.dispatch({ type: 'COLLECT_TAX' }, state);
    expect(next.treasury.balance).toBe(0);
    expect(next.coins).toBe(initialCoins + 250);
  });

  it('T-ACT-020: ESTABLISH_ROUTE starts trade route', () => {
    const next = engine.dispatch({
      type: 'ESTABLISH_ROUTE',
      route: {
        originRegionId: 'reg.greenvale',
        destinationRegionId: 'reg.riverford',
        itemId: 'item.raw.wheat',
        quantity: 20,
      },
    }, state);
    expect(next.trade.routes.length).toBe(1);
    expect(next.trade.routes[0].active).toBe(true);
  });
});
