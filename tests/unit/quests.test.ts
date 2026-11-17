import { describe, it, expect } from 'vitest';
import questsData from '../../src/data/quests.json';

describe('Quest Engine (7 Cases)', () => {
  it('1. Exactly 36 quests exist with unique IDs', () => {
    expect(questsData.length).toBe(36);
    const ids = new Set(questsData.map((q) => q.questId));
    expect(ids.size).toBe(36);
  });

  it('2. All prerequisites resolve to existing quest IDs', () => {
    const ids = new Set(questsData.map((q) => q.questId));
    for (const q of questsData) {
      for (const prereq of q.prerequisites) {
        expect(ids.has(prereq)).toBe(true);
      }
    }
  });

  it('3. No circular dependencies exist across the quest DAG', () => {
    const questMap = new Map(questsData.map((q) => [q.questId, q.prerequisites]));
    const visited = new Set<string>();
    const inStack = new Set<string>();

    function hasCycle(id: string): boolean {
      visited.add(id);
      inStack.add(id);

      const prereqs = questMap.get(id) || [];
      for (const p of prereqs) {
        if (!visited.has(p) && hasCycle(p)) return true;
        if (inStack.has(p)) return true;
      }

      inStack.delete(id);
      return false;
    }

    for (const id of questMap.keys()) {
      if (!visited.has(id)) {
        expect(hasCycle(id)).toBe(false);
      }
    }
  });

  it('4. Chapter 10 quests are strictly linear (001 -> 002 -> 003 -> 004)', () => {
    const ch10_1 = questsData.find((q) => q.questId === 'qst.ch10.001');
    const ch10_2 = questsData.find((q) => q.questId === 'qst.ch10.002');
    const ch10_3 = questsData.find((q) => q.questId === 'qst.ch10.003');
    const ch10_4 = questsData.find((q) => q.questId === 'qst.ch10.004');

    expect(ch10_1).toBeDefined();
    expect(ch10_2?.prerequisites).toEqual(['qst.ch10.001']);
    expect(ch10_3?.prerequisites).toEqual(['qst.ch10.002']);
    expect(ch10_4?.prerequisites).toEqual(['qst.ch10.003']);
  });

  it('5. Quest rewards have valid types and positive amounts', () => {
    const validTypes = ['coins', 'item', 'xp', 'land_deed', 'dynasty_seal', 'relic_fragment'];
    for (const q of questsData) {
      expect(q.rewards.length).toBeGreaterThan(0);
      for (const r of q.rewards) {
        expect(validTypes).toContain(r.type);
        expect(r.amount).toBeGreaterThan(0);
      }
    }
  });

  it('6. Quest objectives have valid counts and non-empty descriptions', () => {
    for (const q of questsData) {
      expect(q.objectives.length).toBeGreaterThan(0);
      for (const obj of q.objectives) {
        expect(obj.count).toBeGreaterThan(0);
        expect(obj.description.length).toBeGreaterThan(0);
      }
    }
  });

  it('7. Quests span all 10 chapters in progression', () => {
    const chapters = new Set(questsData.map((q) => q.chapter));
    for (let c = 1; c <= 10; c++) {
      expect(chapters.has(c)).toBe(true);
    }
  });
});
