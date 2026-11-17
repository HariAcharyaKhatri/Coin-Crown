import { CURRENT_SCHEMA_VERSION } from '../../engine/constants';
import { migrateV1ToV2 } from './v1_to_v2';
import { migrateV2ToV3 } from './v2_to_v3';
import { migrateV3ToV4 } from './v3_to_v4';

export class MigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationError';
  }
}

export function runMigrations(state: any): any {
  if (!state || typeof state !== 'object') {
    throw new MigrationError('Invalid save data');
  }

  const version = state.version ?? 1;

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new MigrationError(
      `Save data version ${version} is higher than supported version ${CURRENT_SCHEMA_VERSION}. Future version refused.`
    );
  }

  let current = { ...state };

  if (current.version === 1 || !current.version) {
    current = migrateV1ToV2(current);
  }
  if (current.version === 2) {
    current = migrateV2ToV3(current);
  }
  if (current.version === 3) {
    current = migrateV3ToV4(current);
  }

  return current;
}
