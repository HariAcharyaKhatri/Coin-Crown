import { db, SaveRecord } from './db';
import { computeChecksum, verifyChecksum } from './checksum';
import { runMigrations } from './migrations';
import { GameState } from '../engine/types/state';

export class SaveCorruptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SaveCorruptionError';
  }
}

export class SaveService {
  /**
   * Saves the game state, performing backup rotation and checksum generation.
   */
  public static async save(state: GameState): Promise<SaveRecord> {
    const jsonStr = JSON.stringify(state);
    const checksum = await computeChecksum(jsonStr);
    const now = Date.now();

    const record: SaveRecord = {
      slot: 'active',
      state: JSON.parse(jsonStr),
      checksum,
      updatedAt: now,
      version: state.version,
    };

    // Rotate backups in a transaction
    await db.transaction('rw', db.saves, async () => {
      const active = await db.saves.get('active');
      if (active) {
        const b2 = await db.saves.get('backup2');
        if (b2) {
          await db.saves.put({ ...b2, slot: 'backup3' });
        }
        const b1 = await db.saves.get('backup1');
        if (b1) {
          await db.saves.put({ ...b1, slot: 'backup2' });
        }
        await db.saves.put({ ...active, slot: 'backup1' });
      }
      await db.saves.put(record);
    });

    return record;
  }

  /**
   * Loads the game state, falling back to backups if primary is corrupt.
   */
  public static async load(): Promise<{ state: GameState; loadedFromSlot: string } | null> {
    const slots = ['active', 'backup1', 'backup2', 'backup3'];

    for (const slot of slots) {
      const record = await db.saves.get(slot);
      if (!record) continue;

      const isValid = await verifyChecksum(JSON.stringify(record.state), record.checksum);
      if (!isValid) {
        console.warn(`[SaveService] Slot ${slot} checksum mismatch. Attempting next backup.`);
        continue;
      }

      try {
        const migrated = runMigrations(record.state);
        return { state: migrated as GameState, loadedFromSlot: slot };
      } catch (err) {
        console.warn(`[SaveService] Migration failed for slot ${slot}:`, err);
        continue;
      }
    }

    // Check if any corrupted saves existed
    const count = await db.saves.count();
    if (count > 0) {
      throw new SaveCorruptionError('All save slots corrupted or unreadable.');
    }

    return null;
  }

  /**
   * Exports the current active save to a JSON string.
   */
  public static async exportSave(): Promise<string> {
    const record = await db.saves.get('active');
    if (!record) {
      throw new Error('No active save found to export');
    }
    return JSON.stringify(record, null, 2);
  }

  /**
   * Imports a save from a JSON string, validating and migrating it.
   */
  public static async importSave(jsonString: string): Promise<GameState> {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }

    const stateToValidate = parsed.state ?? parsed;
    const expectedChecksum = parsed.checksum;

    if (expectedChecksum) {
      const valid = await verifyChecksum(JSON.stringify(stateToValidate), expectedChecksum);
      if (!valid) {
        throw new Error('Import failed: Checksum mismatch');
      }
    }

    const migrated = runMigrations(stateToValidate);
    await this.save(migrated as GameState);
    return migrated as GameState;
  }

  /**
   * Deletes all saves (used for testing or hard reset).
   */
  public static async clearAll(): Promise<void> {
    await db.saves.clear();
  }
}
