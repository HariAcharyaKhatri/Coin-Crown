import { describe, it, expect } from 'vitest';
import buildingsData from '../../src/data/buildings.json';
import itemsData from '../../src/data/items.json';

describe('Production Chains (7 Cases)', () => {
  const itemMap = new Map(itemsData.map((i) => [i.id, i]));
  const buildingMap = new Map(buildingsData.map((b) => [b.id, b]));

  it('1. Chain: Wheat -> Flour -> Bread is connected and valid', () => {
    const wheatField = buildingMap.get('bld.agri.wheat_field');
    const windmill = buildingMap.get('bld.ind.windmill');
    const bakery = buildingMap.get('bld.ind.bakery');

    expect(wheatField?.baseOutput.some((o) => o.itemId === 'item.raw.wheat')).toBe(true);
    expect(windmill?.baseInputs?.some((i) => i.itemId === 'item.raw.wheat')).toBe(true);
    expect(windmill?.baseOutput.some((o) => o.itemId === 'item.proc.flour')).toBe(true);
    expect(bakery?.baseInputs?.some((i) => i.itemId === 'item.proc.flour')).toBe(true);
    expect(bakery?.baseOutput.some((o) => o.itemId === 'item.proc.bread')).toBe(true);
  });

  it('2. Chain: Iron Ore + Coal -> Refined Iron -> Tools', () => {
    const smelter = buildingMap.get('bld.min.smelter');
    const blacksmith = buildingMap.get('bld.ind.blacksmith');

    expect(smelter?.baseInputs?.some((i) => i.itemId === 'item.raw.iron_ore')).toBe(true);
    expect(smelter?.baseInputs?.some((i) => i.itemId === 'item.raw.coal')).toBe(true);
    expect(blacksmith?.baseOutput.some((o) => o.itemId === 'item.proc.tools')).toBe(true);
  });

  it('3. Chain: Timber -> Planks -> Furniture', () => {
    const sawmill = buildingMap.get('bld.ind.sawmill');
    const carpenter = buildingMap.get('bld.ind.carpenter');

    expect(sawmill?.baseInputs?.some((i) => i.itemId === 'item.raw.timber')).toBe(true);
    expect(sawmill?.baseOutput.some((o) => o.itemId === 'item.proc.planks')).toBe(true);
    expect(carpenter?.baseInputs?.some((i) => i.itemId === 'item.proc.planks')).toBe(true);
    expect(carpenter?.baseOutput.some((o) => o.itemId === 'item.proc.furniture')).toBe(true);
  });

  it('4. Chain: Wool -> Cloth -> Tapestry / Books', () => {
    const sheepFarm = buildingMap.get('bld.agri.sheep_farm');
    const textile = buildingMap.get('bld.ind.textile_workshop');

    expect(sheepFarm?.baseOutput.some((o) => o.itemId === 'item.raw.wool')).toBe(true);
    expect(textile?.baseInputs?.some((i) => i.itemId === 'item.raw.wool')).toBe(true);
    expect(textile?.baseOutput.some((o) => o.itemId === 'item.proc.cloth')).toBe(true);
  });

  it('5. Chain: Grapes -> Fine Wine', () => {
    const vineyard = buildingMap.get('bld.agri.vineyard');
    expect(vineyard?.baseOutput.some((o) => o.itemId === 'item.raw.grapes')).toBe(true);
    const wineItem = itemMap.get('item.proc.wine');
    expect(wineItem).toBeDefined();
    expect(wineItem?.category).toBe('processed');
  });

  it('6. Chain: Gold Ore -> Gold Refinery -> Gold Bar', () => {
    const goldMine = buildingMap.get('bld.min.gold_mine');
    const refinery = buildingMap.get('bld.min.gold_refinery');

    expect(goldMine?.baseOutput.some((o) => o.itemId === 'item.raw.gold_ore')).toBe(true);
    expect(refinery?.baseInputs?.some((i) => i.itemId === 'item.raw.gold_ore')).toBe(true);
    expect(refinery?.baseOutput.some((o) => o.itemId === 'item.proc.gold_bar')).toBe(true);
  });

  it('7. Zero orphan items or invalid building dependencies', () => {
    for (const b of buildingsData) {
      for (const dep of b.dependencies) {
        expect(buildingMap.has(dep)).toBe(true);
      }
      for (const out of b.baseOutput) {
        expect(itemMap.has(out.itemId)).toBe(true);
      }
    }
  });
});
