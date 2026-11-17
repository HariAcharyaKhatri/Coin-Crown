import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { GameEngine } from '../../src/engine/GameEngine';
import { createInitialState } from '../../src/store/gameStore';
import { calculateOfflineAccrual } from '../../src/engine/formulas/offline';
import { SaveService } from '../../src/persistence/SaveService';
import { DashboardScreen } from '../../src/ui/screens/DashboardScreen';

describe('Engine Performance & Timing (6 tests)', () => {
  beforeEach(async () => {
    await SaveService.clearAll();
  });

  it('T-UNIT-PERF-001: GameEngine tick executes in < 8ms on average', () => {
    const engine = new GameEngine();
    let state = createInitialState();
    state.coins = 50_000;
    state.realmTier = 5;

    // Add several buildings across categories
    state.buildings['b1'] = {
      instanceId: 'b1',
      defId: 'bld.agri.wheat_field',
      level: 10,
      condition: 100,
      assignedWorkerIds: ['w1'],
      createdAt: 1000,
    };
    state.buildings['b2'] = {
      instanceId: 'b2',
      defId: 'bld.ind.windmill',
      level: 5,
      condition: 100,
      assignedWorkerIds: [],
      createdAt: 1000,
    };
    state.buildings['b3'] = {
      instanceId: 'b3',
      defId: 'bld.res.stone_house',
      level: 3,
      condition: 100,
      assignedWorkerIds: [],
      createdAt: 1000,
    };

    // Warm-up run
    for (let i = 0; i < 5; i++) {
      state = engine.tick(1000, state);
    }

    const iterations = 50;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      state = engine.tick(1000, state);
    }
    const elapsed = performance.now() - start;
    const avgTickMs = elapsed / iterations;

    expect(avgTickMs).toBeLessThan(8.0);
  });

  it('T-UNIT-PERF-002: Offline accrual formula calculation executes in < 100ms', () => {
    const now = 2_000_000_000;
    const lastSaved = now - 86_400_000;

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      calculateOfflineAccrual(lastSaved, now, 250, 40, 1000, 100_000, 500, 50_000);
    }
    const totalMs = performance.now() - start;
    const perCallMs = totalMs / 1000;

    expect(perCallMs).toBeLessThan(1.0); // < 1ms per call, well within 100ms
  });

  it('T-UNIT-PERF-003: Dexie save operation completes in < 50ms', async () => {
    const state = createInitialState();
    const start = performance.now();
    await SaveService.save(state);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
  });

  it('T-UNIT-PERF-004: Startup state initialization and load completes in < 2,000ms', async () => {
    const start = performance.now();
    const state = createInitialState();
    await SaveService.save(state);
    const loaded = await SaveService.load();
    const elapsed = performance.now() - start;

    expect(loaded).not.toBeNull();
    expect(elapsed).toBeLessThan(2000);
  });

  it('T-UNIT-PERF-005: Component rerender completes within 16ms (60fps budget)', () => {
    // Initial mount (cold)
    const { rerender } = render(React.createElement(DashboardScreen));

    // Measure rerender
    const start = performance.now();
    rerender(React.createElement(DashboardScreen));
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(16.0);
  });

  it('T-UNIT-PERF-006: Game state memory footprint stays under 150MB', () => {
    const state = createInitialState();
    // Stringified size of clean game state
    const jsonBytes = Buffer.byteLength(JSON.stringify(state), 'utf8');

    // Initial state JSON is < 50 KB
    expect(jsonBytes).toBeLessThan(50 * 1024);

    // Node process heap used check
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      expect(memory.heapUsed).toBeLessThan(150 * 1024 * 1024);
    }
  });
});
