import { describe, it, expect, beforeEach } from 'vitest';
import { SaveService, SaveCorruptionError } from '../../src/persistence/SaveService';
import { db } from '../../src/persistence/db';
import { createInitialState } from '../../src/store/gameStore';
import { computeChecksum } from '../../src/persistence/checksum';

describe('Save Recovery & Corruption Layer (6 tests)', () => {
  beforeEach(async () => {
    await SaveService.clearAll();
  });

  it('T-UNIT-REC-001: Primary active save corruption falls back to backup1 seamlessly', () => {
    return (async () => {
      const state1 = createInitialState();
      state1.coins = 500;
      await SaveService.save(state1);

      const state2 = createInitialState();
      state2.coins = 1200;
      await SaveService.save(state2);

      // Now active has 1200, backup1 has 500.
      // Corrupt active save
      await db.saves.update('active', { checksum: 'corrupted_checksum_value' });

      const loaded = await SaveService.load();
      expect(loaded).not.toBeNull();
      expect(loaded!.loadedFromSlot).toBe('backup1');
      expect(loaded!.state.coins).toBe(500);
    })();
  });

  it('T-UNIT-REC-002: Primary and backup1 corrupt falls back to backup2', () => {
    return (async () => {
      const s1 = createInitialState();
      s1.coins = 100;
      await SaveService.save(s1);

      const s2 = createInitialState();
      s2.coins = 200;
      await SaveService.save(s2);

      const s3 = createInitialState();
      s3.coins = 300;
      await SaveService.save(s3);

      // Active: 300, backup1: 200, backup2: 100
      // Corrupt active and backup1
      await db.saves.update('active', { checksum: 'corrupt_hash_1' });
      await db.saves.update('backup1', { checksum: 'corrupt_hash_2' });

      const loaded = await SaveService.load();
      expect(loaded).not.toBeNull();
      expect(loaded!.loadedFromSlot).toBe('backup2');
      expect(loaded!.state.coins).toBe(100);
    })();
  });

  it('T-UNIT-REC-003: All corrupted saves triggers SaveCorruptionError', () => {
    return (async () => {
      const s = createInitialState();
      await SaveService.save(s);
      await db.saves.update('active', { checksum: 'corrupt_hash' });

      await expect(SaveService.load()).rejects.toThrow(SaveCorruptionError);
    })();
  });

  it('T-UNIT-REC-004: exportSave produces valid JSON string and importSave loads it accurately', () => {
    return (async () => {
      const state = createInitialState();
      state.coins = 99999;
      state.realmTier = 5;
      await SaveService.save(state);

      const exportedJson = await SaveService.exportSave();
      expect(typeof exportedJson).toBe('string');

      await SaveService.clearAll();
      expect(await db.saves.count()).toBe(0);

      const imported = await SaveService.importSave(exportedJson);
      expect(imported.coins).toBe(99999);
      expect(imported.realmTier).toBe(5);

      const loaded = await SaveService.load();
      expect(loaded!.state.coins).toBe(99999);
    })();
  });

  it('T-UNIT-REC-005: importSave rejects malformed JSON and corrupted checksums', () => {
    return (async () => {
      // Malformed JSON
      await expect(SaveService.importSave('not a json string')).rejects.toThrow(/Invalid JSON format/);

      // Valid JSON structure but tampered checksum
      const state = createInitialState();
      const fakeSave = {
        state,
        checksum: 'invalid_sha256_hash_here',
      };
      await expect(SaveService.importSave(JSON.stringify(fakeSave))).rejects.toThrow(/Checksum mismatch/);
    })();
  });

  it('T-UNIT-REC-006: Future save versions are rejected by the migration engine', () => {
    return (async () => {
      const futureState = createInitialState();
      futureState.version = 99; // Future version beyond supported 4
      const json = JSON.stringify(futureState);
      const checksum = await computeChecksum(json);

      await db.saves.put({
        slot: 'active',
        state: futureState,
        checksum,
        updatedAt: Date.now(),
        version: 99,
      });

      // When loading, future version triggers migration error and throws SaveCorruptionError (as only slot fails)
      await expect(SaveService.load()).rejects.toThrow(SaveCorruptionError);
    })();
  });
});
