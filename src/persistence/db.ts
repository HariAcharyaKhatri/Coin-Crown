import Dexie, { type EntityTable } from 'dexie';

export interface SaveRecord {
  slot: string;
  state: any;
  checksum: string;
  updatedAt: number;
  version: number;
}

export class CrownAndCoinDB extends Dexie {
  saves!: EntityTable<SaveRecord, 'slot'>;

  constructor() {
    super('CrownAndCoinDB');
    this.version(1).stores({
      saves: 'slot, updatedAt, version',
    });
  }
}

export const db = new CrownAndCoinDB();
