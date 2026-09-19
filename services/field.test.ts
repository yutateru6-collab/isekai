import { describe, expect, it } from 'vitest';
import { CREATURES, ITEMS, SEARCH_AREAS } from '../constants';
import { TimeOfDay } from '../types';
import { FIELD_SIGNALS } from '../data/fieldSignals';
import { MISSIONS, missionConditionsMet } from '../data/missions';
import { createFieldSpots } from './field';
import { eligibleCreatures } from './game';
import { emptyProgress, parseProgress, progressReducer } from './progress';
function seeded(seed: number) { let value = seed; return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; }; }

describe('field observation, not a hidden route lottery', () => {
  it('authors a distinct, non-empty signal for every one of the 33 species', () => {
    expect(Object.keys(FIELD_SIGNALS).sort()).toEqual(CREATURES.map(c => c.id).sort());
    expect(new Set(Object.values(FIELD_SIGNALS).map(s => s.label)).size).toBe(33);
    for (const c of CREATURES) { expect(FIELD_SIGNALS[c.id].detail.length).toBeGreaterThan(15); expect(FIELD_SIGNALS[c.id].label).not.toContain(c.name); }
  });
  it('never bypasses mystery unlock or accepts a missing area', () => {
    expect(createFieldSpots('mystery', TimeOfDay.Day, [], [], null)).toEqual([]);
    expect(createFieldSpots('fake', TimeOfDay.Day, [], [], null)).toEqual([]);
  });
  it('offers only actual habitat/time matches and known items for all areas and times', () => {
    const discovered = CREATURES.slice(0, 5).map(c => c.id);
    for (const a of SEARCH_AREAS) for (const time of [TimeOfDay.Morning, TimeOfDay.Day, TimeOfDay.Sunset, TimeOfDay.Night]) {
      const pool = eligibleCreatures(a.id, time, discovered);
      for (let seed = 1; seed < 25; seed++) {
        const spots = createFieldSpots(a.id, time, discovered, [], null, false, seeded(seed));
        expect(spots.length).toBeGreaterThan(0);
        expect(new Set(spots.map(s => s.id)).size).toBe(spots.length);
        for (const spot of spots) {
          expect(spot.x).toBeGreaterThan(5); expect(spot.x).toBeLessThan(95);
          if (spot.reward.type === 'creature') expect(pool.some(c => c.id === spot.reward.data.id)).toBe(true);
          else expect(ITEMS.some(i => i.id === spot.reward.data.id)).toBe(true);
        }
      }
    }
  });
  it('always includes the target trace when the mission conditions are solved', () => {
    for (const m of MISSIONS) for (let seed = 1; seed <= 100; seed++) {
      const inventory = m.requiredItemId ? [m.requiredItemId] : [];
      const spots = createFieldSpots(m.areaId, m.time, [], inventory, m, false, seeded(seed));
      expect(spots.some(s => s.reward.type === 'creature' && s.reward.data.id === m.targetCreatureId), m.id).toBe(true);
    }
  });
  it('makes the required tool deliberately obtainable without random drops', () => {
    const m = MISSIONS.find(m => m.requiredItemId)!;
    for (const area of SEARCH_AREAS.filter(a => a.id !== 'mystery')) {
      const spots = createFieldSpots(area.id, TimeOfDay.Day, [], [], m, false, seeded(3));
      expect(spots.some(s => s.reward.type === 'item' && s.reward.data.id === m.requiredItemId)).toBe(true);
    }
  });
  it('reproduces a session from the same seed, and does not mutate the catalog', () => {
    const before = JSON.stringify(CREATURES);
    const a = createFieldSpots('house', TimeOfDay.Day, [], [], null, false, seeded(4));
    const b = createFieldSpots('house', TimeOfDay.Day, [], [], null, false, seeded(4));
    expect(a).toEqual(b); expect(JSON.stringify(CREATURES)).toBe(before);
  });
  it('retains reachability of every species through free field observation', () => {
    const seen = new Set<string>();
    for (const area of SEARCH_AREAS) for (const time of [TimeOfDay.Morning, TimeOfDay.Day, TimeOfDay.Sunset, TimeOfDay.Night]) for (let seed = 1; seed <= 500; seed++) {
      for (const spot of createFieldSpots(area.id, time, CREATURES.map(c => c.id), [], null, false, seeded(seed))) if (spot.reward.type === 'creature') seen.add(spot.reward.data.id);
    }
    expect([...seen].sort()).toEqual(CREATURES.map(c => c.id).sort());
  });
  it('can finish all six missions with only field-obtainable rewards and preserve the result', () => {
    let p = { ...emptyProgress(), onboarded: true };
    for (const m of MISSIONS) {
      if (m.requiredItemId && !p.inventory.includes(m.requiredItemId)) {
        const tool = createFieldSpots(m.areaId, m.time, p.discoveredIds, p.inventory, m).find(s => s.reward.type === 'item' && s.reward.data.id === m.requiredItemId)!;
        p = progressReducer(p, { type: 'item', id: tool.reward.data.id });
      }
      const target = createFieldSpots(m.areaId, m.time, p.discoveredIds, p.inventory, m).find(s => s.reward.type === 'creature' && s.reward.data.id === m.targetCreatureId)!;
      expect(missionConditionsMet(m, target.reward.data.id, m.areaId, m.time, p.inventory)).toBe(true);
      p = progressReducer(p, { type: 'capture', id: target.reward.data.id });
      p = progressReducer(p, { type: 'missionComplete', id: m.id });
      p = progressReducer(p, { type: 'missionSeen', id: m.id });
    }
    expect(p.completedMissionIds).toHaveLength(6);
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
  });
});
