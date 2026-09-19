import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { CREATURES, SEARCH_AREAS, ITEMS } from '../constants';
import { TimeOfDay, CreatureType } from '../types';
import { eligibleCreatures, pickCreature, currentTimeOfDay, localDate, MILESTONES, dailyNews } from './game';
import { UNCLE_MESSAGES } from '../data/uncleMessages';
import { emptyProgress, parseProgress, progressReducer as reduce } from './progress';

describe('catalog and playable progression', () => {
  it('contains 33 complete, unique creatures with real media', () => {
    expect(CREATURES).toHaveLength(33);
    expect(new Set(CREATURES.map(c => c.id)).size).toBe(33);
    for (const c of CREATURES) {
      expect(c.name).not.toBe('？？？');
      expect(c.trivia.length).toBeGreaterThan(0);
      for (const path of [c.imageUrl, c.sketchUrl, c.realImageUrl]) if (path) expect(existsSync(`public${path}`), path).toBe(true);
    }
    for (const m of UNCLE_MESSAGES) expect(existsSync(`public${m.image}`)).toBe(true);
  });
  it('gates the mystery area, filters habitats and actual active times', () => {
    expect(eligibleCreatures('mystery', TimeOfDay.Day, [])).toEqual([]);
    expect(eligibleCreatures('unknown', TimeOfDay.Day, [])).toEqual([]);
    for (const area of SEARCH_AREAS) for (const time of [TimeOfDay.Morning, TimeOfDay.Day, TimeOfDay.Sunset, TimeOfDay.Night]) {
      for (const creature of eligibleCreatures(area.id, time, CREATURES.slice(0, 5).map(c => c.id))) {
        expect(creature.type).toBe(area.type);
        expect(creature.activeTime.includes(time) || creature.activeTime.includes(TimeOfDay.Any)).toBe(true);
      }
    }
  });
  it('can progress from zero to every species, every chapter and 100%', () => {
    let state = emptyProgress();
    for (let pass = 0; pass < 2; pass++) for (const area of SEARCH_AREAS) for (const time of Object.values(TimeOfDay).filter(t => t !== TimeOfDay.Any)) {
      for (const c of eligibleCreatures(area.id, time, state.discoveredIds)) state = reduce(state, { type: 'capture', id: c.id });
    }
    expect([...state.discoveredIds].sort()).toEqual(CREATURES.map(c => c.id).sort());
    expect(state.discoveredIds.length / CREATURES.length * 100).toBe(100);
    expect(UNCLE_MESSAGES.map(m => m.milestone)).toEqual(MILESTONES);
    for (const milestone of MILESTONES) state = reduce(state, { type: 'read', milestone });
    expect(state.readMilestones).toEqual(MILESTONES);
  });
  it('keeps every eligible species selectable including the last unseen one', () => {
    const pool = CREATURES.filter(c => c.type === CreatureType.House);
    const selected = new Set(Array.from({ length: 1000 }, (_, i) => pickCreature(pool, [], false, () => i / 1000)?.id));
    expect(selected.size).toBe(pool.length);
    expect(pickCreature([], [])).toBeUndefined();
    const half = [CREATURES[0], CREATURES[1]];
    expect(pickCreature(half, [half[0].id], false, () => 0.5)?.id).toBe(half[1].id);
  });
  it('uses local calendar days, all four boundaries, and stable daily forecasts', () => {
    const date = new Date(2026, 8, 19, 0, 30);
    expect(localDate(date)).toBe('2026-09-19');
    for (const [hour, time] of [[4, TimeOfDay.Night], [5, TimeOfDay.Morning], [10, TimeOfDay.Day], [16, TimeOfDay.Sunset], [19, TimeOfDay.Night]] as const) expect(currentTimeOfDay(new Date(2026, 8, 19, hour))).toBe(time);
    expect(dailyNews('2026-09-19')).toEqual(dailyNews('2026-09-19'));
    expect(SEARCH_AREAS.some(a => a.id === dailyNews().bonusAreaId)).toBe(true);
  });
});

describe('save, inventory and bond integrity', () => {
  it('starts empty and deduplicates captures while rewarding repeat observations', () => {
    let p = emptyProgress();
    expect(p.discoveredIds).toEqual([]);
    p = reduce(p, { type: 'capture', id: '001' });
    p = reduce(p, { type: 'capture', id: '001' });
    expect(p.discoveredIds).toEqual(['001']);
    expect(p.captures).toBe(2);
    expect(p.inventory).toEqual(['item_nut']);
    expect(reduce(p, { type: 'capture', id: 'debug_0' })).toBe(p);
  });
  it('cannot buddy or favorite an undiscovered creature', () => {
    const p = emptyProgress();
    expect(reduce(p, { type: 'buddy', id: '001' })).toBe(p);
    expect(reduce(p, { type: 'favorite', id: '001' })).toBe(p);
    expect(reduce(p, { type: 'read', milestone: 33 })).toBe(p);
  });
  it('awards one daily item even on duplicate effect execution or clock rollback', () => {
    let p = reduce(emptyProgress(), { type: 'register', name: '調査太郎' });
    const action = { type: 'daily', date: '2026-09-19', itemId: 'item_candy' } as const;
    p = reduce(reduce(p, action), action);
    p = reduce(p, { ...action, date: '2026-09-18' });
    expect(p.inventory).toHaveLength(1);
    p = reduce(p, { ...action, date: '2026-09-20' });
    expect(p.inventory).toHaveLength(2);
  });
  it('consumes one item atomically, preserves each species bond and caps at 100', () => {
    let p = reduce(emptyProgress(), { type: 'capture', id: '001' });
    p = reduce(p, { type: 'capture', id: '002' });
    p = reduce(p, { type: 'buddy', id: '001' });
    p = reduce(p, { type: 'item', id: 'item_candy' });
    p = reduce(reduce(p, { type: 'feed', id: 'item_candy' }), { type: 'feed', id: 'item_candy' });
    expect(p.bonds['001']).toBe(20); expect(p.inventory).toEqual([]);
    p = reduce(p, { type: 'buddy', id: '002' }); p = reduce(p, { type: 'pet' });
    p = reduce(p, { type: 'buddy', id: '001' });
    expect(p.bonds).toEqual({ '001': 20, '002': 1 });
    for (let i = 0; i < 100; i++) p = reduce(p, { type: 'pet' });
    p = reduce(p, { type: 'item', id: 'item_candy' });
    p = reduce(p, { type: 'feed', id: 'item_candy' });
    expect(p.bonds['001']).toBe(100); expect(p.inventory).toEqual(['item_candy']);
  });
  it('roundtrips a completed saved game and preserves inventory counts', () => {
    let p = reduce(emptyProgress(), { type: 'register', name: 'テスト' });
    for (const c of CREATURES) p = reduce(p, { type: 'capture', id: c.id });
    for (const item of [...ITEMS, ...ITEMS]) p = reduce(p, { type: 'item', id: item.id });
    p = reduce(p, { type: 'buddy', id: '044' });
    p = reduce(p, { type: 'favorite', id: '044' });
    p = reduce(p, { type: 'pet' });
    p = reduce(p, { type: 'read', milestone: 33 });
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
  });
  it('rejects malformed or unsupported saves and sanitizes unknown catalog data', () => {
    for (const raw of ['null', '{}', '{', '[]', JSON.stringify({ ...emptyProgress(), version: 2 }), JSON.stringify({ ...emptyProgress(), bonds: [] }), JSON.stringify({ ...emptyProgress(), captures: -1 })]) expect(() => parseProgress(raw)).toThrow();
    const clean = parseProgress(JSON.stringify({ ...emptyProgress(), discoveredIds: ['001', '001', 'debug_0'], favorites: ['002'], inventory: ['fake'], buddyId: '002', bonds: { '001': 1000 }, readMilestones: [33] }));
    expect(clean.discoveredIds).toEqual(['001']); expect(clean.bonds).toEqual({ '001': 100 });
    expect(clean.favorites).toEqual([]); expect(clean.buddyId).toBeNull(); expect(clean.inventory).toEqual([]); expect(clean.readMilestones).toEqual([]);
  });
});
