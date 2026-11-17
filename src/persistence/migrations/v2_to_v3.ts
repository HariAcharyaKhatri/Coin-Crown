export function migrateV2ToV3(state: any): any {
  const updated = { ...state, version: 3 };
  if ('gold' in updated) {
    updated.coins = updated.gold;
    delete updated.gold;
  }
  if ('lifetimeGold' in updated) {
    updated.lifetimeCoins = updated.lifetimeGold;
    delete updated.lifetimeGold;
  }
  return updated;
}
