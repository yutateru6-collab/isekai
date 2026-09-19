import { CREATURES, ITEMS } from '../constants';
import { MILESTONES } from './game';

export const SAVE_KEY = 'parallel-zukan-save-v1';
export interface Progress {
  version: 1;
  userName: string;
  onboarded: boolean;
  discoveredIds: string[];
  favorites: string[];
  inventory: string[];
  buddyId: string | null;
  bonds: Record<string, number>;
  readMilestones: number[];
  lastRewardDate: string;
  captures: number;
}
export const emptyProgress = (): Progress => ({ version: 1, userName: '調査員', onboarded: false, discoveredIds: [], favorites: [], inventory: [], buddyId: null, bonds: {}, readMilestones: [], lastRewardDate: '', captures: 0 });
const creatureIds = new Set(CREATURES.map(c => c.id));
const itemIds = new Set(ITEMS.map(i => i.id));
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');

// Validate imports as untrusted data; only canonical catalog IDs enter the game.
export function parseProgress(raw: string): Progress {
  const p: unknown = JSON.parse(raw);
  if (!isRecord(p) || p.version !== 1 || typeof p.userName !== 'string' || typeof p.onboarded !== 'boolean' ||
    !isStrings(p.discoveredIds) || !isStrings(p.favorites) || !isStrings(p.inventory) || p.inventory.length > 10000 ||
    !(p.buddyId === null || typeof p.buddyId === 'string') || !isRecord(p.bonds) ||
    !Array.isArray(p.readMilestones) || !p.readMilestones.every(n => typeof n === 'number') ||
    typeof p.lastRewardDate !== 'string' || !/^$|^\d{4}-\d{2}-\d{2}$/.test(p.lastRewardDate) ||
    typeof p.captures !== 'number' || !Number.isSafeInteger(p.captures) || p.captures < 0) throw new Error('異世界ずかんの保存データではありません。');
  const discoveredIds = [...new Set(p.discoveredIds.filter(id => creatureIds.has(id)))];
  const bonds: Record<string, number> = {};
  for (const id of discoveredIds) {
    const value = p.bonds[id];
    if (typeof value === 'number' && Number.isFinite(value)) bonds[id] = Math.min(100, Math.max(0, Math.floor(value)));
  }
  return { version: 1, userName: p.userName.trim().slice(0, 10) || '調査員', onboarded: p.onboarded,
    discoveredIds, favorites: [...new Set(p.favorites.filter(id => discoveredIds.includes(id)))],
    inventory: p.inventory.filter(id => itemIds.has(id)), buddyId: typeof p.buddyId === 'string' && discoveredIds.includes(p.buddyId) ? p.buddyId : null,
    bonds, readMilestones: [...new Set(p.readMilestones.filter(n => MILESTONES.includes(n) && n <= discoveredIds.length))],
    lastRewardDate: p.lastRewardDate, captures: Math.max(discoveredIds.length, p.captures) };
}

export type Action =
  | { type: 'register'; name: string }
  | { type: 'capture'; id: string }
  | { type: 'item'; id: string }
  | { type: 'favorite'; id: string }
  | { type: 'buddy'; id: string }
  | { type: 'pet' }
  | { type: 'feed'; id: string }
  | { type: 'read'; milestone: number }
  | { type: 'daily'; date: string; itemId: string }
  | { type: 'restore'; progress: Progress };

export function progressReducer(p: Progress, action: Action): Progress {
  switch (action.type) {
    case 'register': return { ...p, userName: action.name.trim().slice(0, 10) || '調査員', onboarded: true };
    case 'capture': {
      if (!creatureIds.has(action.id)) return p;
      const duplicate = p.discoveredIds.includes(action.id);
      return { ...p, captures: p.captures + 1, discoveredIds: duplicate ? p.discoveredIds : [...p.discoveredIds, action.id],
        inventory: duplicate ? [...p.inventory, 'item_nut'] : p.inventory };
    }
    case 'item': return itemIds.has(action.id) ? { ...p, inventory: [...p.inventory, action.id] } : p;
    case 'favorite': return p.discoveredIds.includes(action.id) ? { ...p, favorites: p.favorites.includes(action.id) ? p.favorites.filter(id => id !== action.id) : [...p.favorites, action.id] } : p;
    case 'buddy': return p.discoveredIds.includes(action.id) ? { ...p, buddyId: action.id } : p;
    case 'pet': return p.buddyId ? { ...p, bonds: { ...p.bonds, [p.buddyId]: Math.min(100, (p.bonds[p.buddyId] ?? 0) + 1) } } : p;
    case 'feed': {
      const index = p.inventory.indexOf(action.id);
      const item = ITEMS.find(i => i.id === action.id);
      if (index < 0 || !item || !p.buddyId || (p.bonds[p.buddyId] ?? 0) >= 100) return p;
      return { ...p, inventory: p.inventory.filter((_, i) => i !== index), bonds: { ...p.bonds, [p.buddyId]: Math.min(100, (p.bonds[p.buddyId] ?? 0) + item.effectValue) } };
    }
    case 'read': return MILESTONES.includes(action.milestone) && action.milestone <= p.discoveredIds.length && !p.readMilestones.includes(action.milestone) ? { ...p, readMilestones: [...p.readMilestones, action.milestone] } : p;
    case 'daily': return p.onboarded && itemIds.has(action.itemId) && action.date > p.lastRewardDate ? { ...p, lastRewardDate: action.date, inventory: [...p.inventory, action.itemId] } : p;
    case 'restore': return action.progress;
  }
}
