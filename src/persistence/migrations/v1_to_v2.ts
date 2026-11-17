export function migrateV1ToV2(state: any): any {
  const updated = { ...state, version: 2 };
  if (updated.buildings) {
    const newBuildings: Record<string, any> = {};
    for (const [key, b] of Object.entries(updated.buildings)) {
      newBuildings[key] = {
        ...(b as any),
        condition: (b as any).condition ?? 100,
      };
    }
    updated.buildings = newBuildings;
  }
  return updated;
}
