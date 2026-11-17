import buildings from '../src/data/buildings.json';
import items from '../src/data/items.json';

console.log(`Auditing asset coverage for ${buildings.length} buildings and ${items.length} items...`);
// Confirm all buildings have names and categories
for (const b of buildings) {
  if (!b.name || !b.category) {
    throw new Error(`Building ${b.id} missing name or category`);
  }
}

// Confirm all items have storageClass and categories
for (const i of items) {
  if (!i.name || !i.storageClass || !i.category) {
    throw new Error(`Item ${i.id} missing name, storageClass, or category`);
  }
}

console.log('✓ Asset metadata coverage 100% complete.');
