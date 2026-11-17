import buildings from '../src/data/buildings.json';
import items from '../src/data/items.json';
import quests from '../src/data/quests.json';
import achievements from '../src/data/achievements.json';

const buildingIds = new Set(buildings.map((b) => b.id));
const itemIds = new Set(items.map((i) => i.id));
const questIds = new Set(quests.map((q) => q.questId));

console.log('Verifying catalog cross-references...');

// Verify buildings
for (const b of buildings) {
  for (const dep of b.dependencies) {
    if (!buildingIds.has(dep)) {
      throw new Error(`Building ${b.id} has invalid dependency ${dep}`);
    }
  }
  for (const out of b.baseOutput) {
    if (!itemIds.has(out.itemId)) {
      throw new Error(`Building ${b.id} produces non-existent item ${out.itemId}`);
    }
  }
  if ((b as any).baseInputs) {
    for (const inp of (b as any).baseInputs) {
      if (!itemIds.has(inp.itemId)) {
        throw new Error(`Building ${b.id} consumes non-existent item ${inp.itemId}`);
      }
    }
  }
}

// Verify quests
for (const q of quests) {
  for (const prereq of q.prerequisites) {
    if (!questIds.has(prereq)) {
      throw new Error(`Quest ${q.questId} has non-existent prerequisite ${prereq}`);
    }
  }
  for (const obj of q.objectives as any[]) {
    if (obj.type === 'build_def' || obj.type === 'own_building_count') {
      if (obj.targetId && !buildingIds.has(obj.targetId)) {
        throw new Error(`Quest ${q.questId} targets non-existent building ${obj.targetId}`);
      }
    }
    if (obj.type === 'produce_item') {
      if (obj.targetId && !itemIds.has(obj.targetId)) {
        throw new Error(`Quest ${q.questId} targets non-existent item ${obj.targetId}`);
      }
    }
  }
  for (const rew of q.rewards as any[]) {
    if (rew.type === 'item' && rew.id && !itemIds.has(rew.id)) {
      throw new Error(`Quest ${q.questId} awards non-existent item ${rew.id}`);
    }
  }
}

// Verify Chapter 10 is linear
const ch10_2 = quests.find((q) => q.questId === 'qst.ch10.002');
const ch10_3 = quests.find((q) => q.questId === 'qst.ch10.003');
const ch10_4 = quests.find((q) => q.questId === 'qst.ch10.004');

if (!ch10_2?.prerequisites.includes('qst.ch10.001')) throw new Error('ch10.002 must require ch10.001');
if (!ch10_3?.prerequisites.includes('qst.ch10.002')) throw new Error('ch10.003 must require ch10.002');
if (!ch10_4?.prerequisites.includes('qst.ch10.003')) throw new Error('ch10.004 must require ch10.003');

// Verify achievements
for (const a of achievements) {
  if (a.condition.type === 'quest_completed') {
    if (a.condition.target && !questIds.has(a.condition.target as string)) {
      throw new Error(`Achievement ${a.achievementId} targets non-existent quest ${a.condition.target}`);
    }
  }
}

console.log('✓ All cross-references, dependencies, and prerequisites are 100% valid!');
