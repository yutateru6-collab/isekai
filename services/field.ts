import { CREATURES, ITEMS, SEARCH_AREAS } from '../constants';
import { Creature, Item, TimeOfDay } from '../types';
import { FIELD_SIGNALS, FieldSignal } from '../data/fieldSignals';
import { InvestigationMission, missionBoostAvailable } from '../data/missions';
import { eligibleCreatures, MYSTERY_UNLOCK, pickCreature } from './game';

export type FieldReward = { type: 'creature'; data: Creature } | { type: 'item'; data: Item };
export interface FieldSpot {
  id: string;
  signal: FieldSignal;
  reward: FieldReward;
  x: number;
  y: number;
}

export function createFieldSpots(areaId: string, time: TimeOfDay, discovered: string[], inventory: string[], mission: InvestigationMission | null, rareBonus = false, random: () => number = Math.random): FieldSpot[] {
  if (!SEARCH_AREAS.some(a => a.id === areaId) || (areaId === 'mystery' && discovered.length < MYSTERY_UNLOCK)) return [];
  const pool = eligibleCreatures(areaId, time, discovered);
  const matching = missionBoostAvailable(mission, areaId, time, inventory);
  const target = matching ? pool.find(c => c.id === mission?.targetCreatureId) : undefined;
  const first = target ?? pickCreature(pool, discovered, rareBonus, random);
  const second = pickCreature(pool.filter(c => c.id !== first?.id), discovered, rareBonus, random);
  const candidates: Array<{ signal: FieldSignal; reward: FieldReward }> = [];
  for (const creature of [first, second]) {
    if (!creature) continue;
    candidates.push({ signal: FIELD_SIGNALS[creature.id] ?? { label: '未知の足あと', detail: 'ここに何かが隠れている。静かに近づいて観察しよう。', kind: 'trace' }, reward: { type: 'creature', data: creature } });
  }
  // A required tool must be obtainable by a deliberate choice, never by grinding a lottery.
  const required = mission?.requiredItemId && !inventory.includes(mission.requiredItemId) ? mission.requiredItemId : null;
  const selectedItems = [required ?? 'item_nut', 'item_stone', 'item_screw'];
  for (const itemId of selectedItems) {
    if (candidates.length >= 3) break;
    const item = ITEMS.find(i => i.id === itemId)!;
    if (candidates.some(c => c.reward.type === 'item' && c.reward.data.id === item.id)) continue;
    candidates.push({ signal: { label: item.id === 'item_screw' ? '金属の落とし物' : item.id === 'item_stone' ? '丸い石の反射' : '落ちている木の実', detail: `${item.name}らしきものが落ちている。調べるとバッグに回収できる。`, kind: 'light' }, reward: { type: 'item', data: item } });
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const positions = [[24, 60], [68, 37], [75, 78]];
  return candidates.map((candidate, index) => ({ ...candidate, id: `trace-${index + 1}`, x: positions[index][0], y: positions[index][1] }));
}

export const anonymousName = (id: string) => `未確認生物 No.${id}`;
export const catalogIds = new Set(CREATURES.map(c => c.id));
