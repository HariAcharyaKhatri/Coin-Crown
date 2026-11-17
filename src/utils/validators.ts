import { GameState } from '../engine/types/state';

export function isValidGameState(state: any): state is GameState {
  if (!state || typeof state !== 'object') return false;
  return (
    typeof state.version === 'number' &&
    typeof state.coins === 'number' &&
    typeof state.lifetimeCoins === 'number' &&
    typeof state.buildings === 'object' &&
    typeof state.population === 'object' &&
    typeof state.treasury === 'object'
  );
}

export function validateBuildingId(id: string): boolean {
  return /^bld\.(res|agri|ind|min|com|roy)\.[a-z0-9_]+$/.test(id);
}

export function validateItemId(id: string): boolean {
  return /^item\.(raw|proc|lux|cons|quest)\.[a-z0-9_]+$/.test(id);
}
