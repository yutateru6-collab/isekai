import { CREATURES, ITEMS } from '../constants';
import { MISSION_IDS } from '../data/missions';
import { validBehaviorIds } from '../data/behaviors';
import { appendBondMemories, appendMemory, isValidMemoryId } from './buddy';
import { MILESTONES } from './game';

export const SAVE_KEY = 'parallel-zukan-save-v2';
export const LEGACY_SAVE_KEY = 'parallel-zukan-save-v1';

export interface Progress {
  version: 2;
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
  petDate: string;
  petCount: number;
  completedMissionIds: string[];
  seenMissionPostscriptIds: string[];
  observations: Record<string, string[]>;
  buddyMemories: Record<string, string[]>;
}

export const emptyProgress = (): Progress => ({
  version: 2,
  userName: '調査員',
  onboarded: false,
  discoveredIds: [],
  favorites: [],
  inventory: [],
  buddyId: null,
  bonds: {},
  readMilestones: [],
  lastRewardDate: '',
  captures: 0,
  petDate: '',
  petCount: 0,
  completedMissionIds: [],
  seenMissionPostscriptIds: [],
  observations: {},
  buddyMemories: {}
});

const creatureIds = new Set(CREATURES.map(c => c.id));
const itemIds = new Set(ITEMS.map(i => i.id));
const areaIds = new Set(['park', 'garden', 'water', 'house', 'mystery']);
const datePattern = /^$|^\d{4}-\d{2}-\d{2}$/;
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');

function parseCommon(p: Record<string, unknown>) {
  if (typeof p.userName !== 'string' || typeof p.onboarded !== 'boolean' ||
    !isStrings(p.discoveredIds) || !isStrings(p.favorites) || !isStrings(p.inventory) || p.inventory.length > 10000 ||
    !(p.buddyId === null || typeof p.buddyId === 'string') || !isRecord(p.bonds) ||
    !Array.isArray(p.readMilestones) || !p.readMilestones.every(n => typeof n === 'number') ||
    typeof p.lastRewardDate !== 'string' || !datePattern.test(p.lastRewardDate) ||
    typeof p.captures !== 'number' || !Number.isSafeInteger(p.captures) || p.captures < 0) {
    throw new Error('異世界ずかんの保存データではありません。');
  }
  const discoveredIds = [...new Set(p.discoveredIds.filter(id => creatureIds.has(id)))];
  const bonds: Record<string, number> = {};
  for (const id of discoveredIds) {
    const value = p.bonds[id];
    if (typeof value === 'number' && Number.isFinite(value)) bonds[id] = Math.min(100, Math.max(0, Math.floor(value)));
  }
  return {
    userName: p.userName.trim().slice(0, 10) || '調査員',
    onboarded: p.onboarded,
    discoveredIds,
    favorites: [...new Set(p.favorites.filter(id => discoveredIds.includes(id)))],
    inventory: p.inventory.filter(id => itemIds.has(id)),
    buddyId: typeof p.buddyId === 'string' && discoveredIds.includes(p.buddyId) ? p.buddyId : null,
    bonds,
    readMilestones: [...new Set(p.readMilestones.filter(n => MILESTONES.includes(n) && n <= discoveredIds.length))],
    lastRewardDate: p.lastRewardDate,
    captures: Math.max(discoveredIds.length, p.captures)
  };
}

function sanitizeObservations(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {};
  const result: Record<string, string[]> = {};
  for (const [creatureId, rawIds] of Object.entries(value)) {
    if (!creatureIds.has(creatureId) || !isStrings(rawIds)) continue;
    const allowed = validBehaviorIds(creatureId);
    const ids = [...new Set(rawIds.filter(id => allowed.has(id)))];
    if (ids.length) result[creatureId] = ids;
  }
  return result;
}

function sanitizeMemories(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {};
  const result: Record<string, string[]> = {};
  for (const [creatureId, rawIds] of Object.entries(value)) {
    if (!creatureIds.has(creatureId) || !isStrings(rawIds)) continue;
    const ids = [...new Set(rawIds.filter(isValidMemoryId))].slice(0, 32);
    if (ids.length) result[creatureId] = ids;
  }
  return result;
}

// Imports are untrusted. Version 1 saves are migrated in memory and then written as v2.
export function parseProgress(raw: string): Progress {
  const p: unknown = JSON.parse(raw);
  if (!isRecord(p) || (p.version !== 1 && p.version !== 2)) throw new Error('異世界ずかんの保存データではありません。');
  const common = parseCommon(p);
  if (p.version === 1) return { ...emptyProgress(), ...common };

  if (typeof p.petDate !== 'string' || !datePattern.test(p.petDate) ||
    typeof p.petCount !== 'number' || !Number.isSafeInteger(p.petCount) || p.petCount < 0 ||
    !isStrings(p.completedMissionIds) || !isStrings(p.seenMissionPostscriptIds)) {
    throw new Error('異世界ずかんの保存データではありません。');
  }

  const completedMissionIds = [...new Set(p.completedMissionIds.filter(id => MISSION_IDS.has(id)))];
  return {
    ...emptyProgress(),
    ...common,
    petDate: p.petDate,
    petCount: Math.min(3, p.petCount),
    completedMissionIds,
    seenMissionPostscriptIds: [...new Set(p.seenMissionPostscriptIds.filter(id => completedMissionIds.includes(id)))],
    observations: sanitizeObservations(p.observations),
    buddyMemories: sanitizeMemories(p.buddyMemories)
  };
}

export type Action =
  | { type: 'register'; name: string }
  | { type: 'capture'; id: string; behaviorVariantId?: string }
  | { type: 'item'; id: string }
  | { type: 'favorite'; id: string }
  | { type: 'buddy'; id: string }
  | { type: 'pet'; date: string }
  | { type: 'feed'; id: string }
  | { type: 'expedition'; areaId: string }
  | { type: 'missionComplete'; id: string }
  | { type: 'missionSeen'; id: string }
  | { type: 'read'; milestone: number }
  | { type: 'daily'; date: string; itemId: string }
  | { type: 'restore'; progress: Progress };

export function progressReducer(p: Progress, action: Action): Progress {
  switch (action.type) {
    case 'register':
      return { ...p, userName: action.name.trim().slice(0, 10) || '調査員', onboarded: true };
    case 'capture': {
      if (!creatureIds.has(action.id)) return p;
      const duplicate = p.discoveredIds.includes(action.id);
      let observations = p.observations;
      if (duplicate && action.behaviorVariantId && validBehaviorIds(action.id).has(action.behaviorVariantId)) {
        const current = observations[action.id] ?? [];
        if (!current.includes(action.behaviorVariantId)) observations = { ...observations, [action.id]: [...current, action.behaviorVariantId] };
      }
      let buddyMemories = p.buddyMemories;
      if (p.buddyId) buddyMemories = appendMemory(buddyMemories, p.buddyId, 'capture-together');
      return {
        ...p,
        captures: p.captures + 1,
        discoveredIds: duplicate ? p.discoveredIds : [...p.discoveredIds, action.id],
        inventory: duplicate ? [...p.inventory, 'item_nut'] : p.inventory,
        observations,
        buddyMemories
      };
    }
    case 'item':
      return itemIds.has(action.id) ? { ...p, inventory: [...p.inventory, action.id] } : p;
    case 'favorite':
      return p.discoveredIds.includes(action.id) ? { ...p, favorites: p.favorites.includes(action.id) ? p.favorites.filter(id => id !== action.id) : [...p.favorites, action.id] } : p;
    case 'buddy':
      return p.discoveredIds.includes(action.id) ? { ...p, buddyId: action.id } : p;
    case 'pet': {
      if (!p.buddyId || !datePattern.test(action.date) || !action.date) return p;
      const sameDay = p.petDate === action.date;
      const count = sameDay ? p.petCount : 0;
      if (count >= 3) return p;
      const before = p.bonds[p.buddyId] ?? 0;
      const after = Math.min(100, before + 2);
      let buddyMemories = appendMemory(p.buddyMemories, p.buddyId, 'first-pet');
      buddyMemories = appendBondMemories(buddyMemories, p.buddyId, before, after);
      return {
        ...p,
        petDate: action.date,
        petCount: count + 1,
        bonds: { ...p.bonds, [p.buddyId]: after },
        buddyMemories
      };
    }
    case 'feed': {
      const index = p.inventory.indexOf(action.id);
      const item = ITEMS.find(i => i.id === action.id);
      if (index < 0 || !item || !p.buddyId || (p.bonds[p.buddyId] ?? 0) >= 100) return p;
      const before = p.bonds[p.buddyId] ?? 0;
      const after = Math.min(100, before + item.effectValue);
      let buddyMemories = appendMemory(p.buddyMemories, p.buddyId, 'first-snack');
      buddyMemories = appendBondMemories(buddyMemories, p.buddyId, before, after);
      return {
        ...p,
        inventory: p.inventory.filter((_, i) => i !== index),
        bonds: { ...p.bonds, [p.buddyId]: after },
        buddyMemories
      };
    }
    case 'expedition': {
      if (!p.buddyId || !areaIds.has(action.areaId)) return p;
      let buddyMemories = appendMemory(p.buddyMemories, p.buddyId, 'first-expedition');
      buddyMemories = appendMemory(buddyMemories, p.buddyId, `area:${action.areaId}`);
      return { ...p, buddyMemories };
    }
    case 'missionComplete':
      return MISSION_IDS.has(action.id) && !p.completedMissionIds.includes(action.id)
        ? { ...p, completedMissionIds: [...p.completedMissionIds, action.id] }
        : p;
    case 'missionSeen':
      return p.completedMissionIds.includes(action.id) && !p.seenMissionPostscriptIds.includes(action.id)
        ? { ...p, seenMissionPostscriptIds: [...p.seenMissionPostscriptIds, action.id] }
        : p;
    case 'read':
      return MILESTONES.includes(action.milestone) && action.milestone <= p.discoveredIds.length && !p.readMilestones.includes(action.milestone)
        ? { ...p, readMilestones: [...p.readMilestones, action.milestone] }
        : p;
    case 'daily':
      return p.onboarded && itemIds.has(action.itemId) && action.date > p.lastRewardDate
        ? { ...p, lastRewardDate: action.date, inventory: [...p.inventory, action.itemId] }
        : p;
    case 'restore':
      return action.progress;
  }
}
