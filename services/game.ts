import { CREATURES, ITEMS, SEARCH_AREAS } from '../constants';
import { Creature, NewsData, TimeOfDay } from '../types';

export const TOTAL_CREATURES = CREATURES.length;
export const MYSTERY_UNLOCK = 5;
export const MILESTONES = [5, 10, 20, 30, TOTAL_CREATURES];
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function currentTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours();
  return hour >= 5 && hour < 10 ? TimeOfDay.Morning : hour >= 10 && hour < 16 ? TimeOfDay.Day : hour >= 16 && hour < 19 ? TimeOfDay.Sunset : TimeOfDay.Night;
}

export function eligibleCreatures(areaId: string, time: TimeOfDay, discovered: string[]): Creature[] {
  const area = SEARCH_AREAS.find(a => a.id === areaId);
  if (!area || (areaId === 'mystery' && discovered.length < MYSTERY_UNLOCK)) return [];
  return CREATURES.filter(c => c.type === area.type && (c.activeTime.includes(TimeOfDay.Any) || c.activeTime.includes(time)));
}

export function pickCreature(pool: Creature[], discovered: string[], rareBonus = false, random = Math.random): Creature | undefined {
  const weights = pool.map(c => (discovered.includes(c.id) ? 1 : 6) * (rareBonus && c.dangerLevel >= 4 ? 2 : 1));
  let cursor = random() * weights.reduce((sum, w) => sum + w, 0);
  return pool.find((_, i) => (cursor -= weights[i]) < 0) ?? pool.at(-1);
}

export function dailyNews(date = localDate()): NewsData {
  const seed = [...date].reduce((a, c) => a * 31 + c.charCodeAt(0), 0) >>> 0;
  const area = SEARCH_AREAS[seed % 4];
  const item = ITEMS[seed % ITEMS.length];
  return { date, type: 'forecast', title: '今日のバイオ予報', bonusAreaId: area.id, luckyItemId: item.id,
    content: `今日は「${area.label}」のレア生物の反応が強い。ラッキーアイテム「${item.name}」を持っていくと、どのエリアでもレア生物に出会いやすくなるぞ。` };
}
