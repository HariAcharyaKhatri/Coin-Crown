import { describe, it, expect, beforeEach } from 'vitest';
import { runMigrations, MigrationError } from '../../src/persistence/migrations';
import { computeChecksum, verifyChecksum } from '../../src/persistence/checksum';
import { SaveService } from '../../src/persistence/SaveService';
import { db } from '../../src/persistence/db';
import { createInitialState } from '../../src/store/gameStore';

describe('Database & Migrations (10 Cases)', () => {
  beforeEach(async () => {
    await db.saves.clear();
  });

  it('1. Migration v1->v2 adds condition=100 to buildings', () => {
    const v1State = {
      version: 1,
      buildings: {
        b1: { instanceId: 'b1', level: 1 },
      },
    };
    const migrated = runMigrations(v1State);
    expect(migrated.version).toBe(4);
    expect(migrated.buildings.b1.condition).toBe(100);
  });

  it('2. Migration v2->v3 renames gold to coins', () => {
    const v2State = {
      version: 2,
      gold: 500,
      lifetimeGold: 1000,
      buildings: {},
    };
    const migrated = runMigrations(v2State);
    expect(migrated.coins).toBe(500);
    expect(migrated.lifetimeCoins).toBe(1000);
    expect((migrated as any).gold).toBeUndefined();
  });

  it('3. Migration v3->v4 adds legacyTree={}', () => {
    const v3State = {
      version: 3,
      coins: 100,
      lifetimeCoins: 100,
      prestige: {
        dynastySeals: 5,
        lifetimeSeals: 5,
        prestigeCount: 1,
      },
    };
    const migrated = runMigrations(v3State);
    expect(migrated.version).toBe(4);
    expect(migrated.prestige.legacyTree).toEqual({});
  });

  it('4. Future schema version > 4 is refused', () => {
    const futureState = {
      version: 99,
      coins: 100,
    };
    expect(() => runMigrations(futureState)).toThrow(MigrationError);
    expect(() => runMigrations(futureState)).toThrow(/Future version refused/);
  });

  it('5. Save roundtrip preserves state', async () => {
    const state = createInitialState();
    state.coins = 999;
    await SaveService.save(state);
    const loaded = await SaveService.load();
    expect(loaded).not.toBeNull();
    expect(loaded?.state.coins).toBe(999);
    expect(loaded?.loadedFromSlot).toBe('active');
  });

  it('6. Checksum is deterministic across object key ordering', async () => {
    const objA = { a: 1, b: 2, c: { d: 3, e: 4 } };
    const objB = { c: { e: 4, d: 3 }, b: 2, a: 1 };
    const hashA = await computeChecksum(objA);
    const hashB = await computeChecksum(objB);
    expect(hashA).toBe(hashB);
  });

  it('7. Checksum mismatch is detected', async () => {
    const state = createInitialState();
    const hash = await computeChecksum(state);
    state.coins = 12345;
    const isValid = await verifyChecksum(state, hash);
    expect(isValid).toBe(false);
  });

  it('8. Backup rotation rotates active into backup1, backup2, backup3', async () => {
    const state1 = createInitialState();
    state1.coins = 100;
    await SaveService.save(state1);

    const state2 = createInitialState();
    state2.coins = 200;
    await SaveService.save(state2);

    const b1 = await db.saves.get('backup1');
    expect(b1).toBeDefined();
    expect(b1?.state.coins).toBe(100);

    const active = await db.saves.get('active');
    expect(active?.state.coins).toBe(200);
  });

  it('9. Corrupt primary active save falls back to backup1', async () => {
    const state1 = createInitialState();
    state1.coins = 100;
    await SaveService.save(state1);

    const state2 = createInitialState();
    state2.coins = 200;
    await SaveService.save(state2);

    // Corrupt active save
    await db.saves.update('active', { checksum: 'bad_checksum_hash' });

    const loaded = await SaveService.load();
    expect(loaded?.loadedFromSlot).toBe('backup1');
    expect(loaded?.state.coins).toBe(100);
  });

  it('10. ClearAll wipes all save slots', async () => {
    const state = createInitialState();
    await SaveService.save(state);
    expect(await db.saves.count()).toBeGreaterThan(0);
    await SaveService.clearAll();
    expect(await db.saves.count()).toBe(0);
  });
});
