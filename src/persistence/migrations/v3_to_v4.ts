export function migrateV3ToV4(state: any): any {
  const updated = { ...state, version: 4 };
  if (!updated.prestige) {
    updated.prestige = {
      dynastySeals: 0,
      lifetimeSeals: 0,
      prestigeCount: 0,
      legacyTree: {},
    };
  } else {
    updated.prestige.legacyTree = updated.prestige.legacyTree ?? {};
  }
  return updated;
}
