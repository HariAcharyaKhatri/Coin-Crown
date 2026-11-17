import buildings from '../src/data/buildings.json';
import items from '../src/data/items.json';
import quests from '../src/data/quests.json';
import achievements from '../src/data/achievements.json';
import regions from '../src/data/regions.json';

function checkUnique(arr: any[], key: string, name: string) {
  const seen = new Set<string>();
  for (const item of arr) {
    const val = item[key];
    if (!val) {
      throw new Error(`[verify-ids] Missing ${key} in ${name}: ${JSON.stringify(item)}`);
    }
    if (seen.has(val)) {
      throw new Error(`[verify-ids] Duplicate ID in ${name}: ${val}`);
    }
    seen.add(val);
  }
  console.log(`✓ ${name}: ${arr.length} unique IDs`);
}

console.log('Verifying Catalog IDs...');
checkUnique(buildings, 'id', 'Buildings');
checkUnique(items, 'id', 'Items');
checkUnique(quests, 'questId', 'Quests');
checkUnique(achievements, 'achievementId', 'Achievements');
checkUnique(regions, 'id', 'Regions');

if (buildings.length !== 65) throw new Error(`Expected 65 buildings, got ${buildings.length}`);
if (items.length !== 55) throw new Error(`Expected 55 items, got ${items.length}`);
if (quests.length !== 36) throw new Error(`Expected 36 quests, got ${quests.length}`);
if (achievements.length !== 60) throw new Error(`Expected 60 achievements, got ${achievements.length}`);
if (regions.length !== 10) throw new Error(`Expected 10 regions, got ${regions.length}`);

console.log('All catalog counts and unique IDs verified successfully!');
