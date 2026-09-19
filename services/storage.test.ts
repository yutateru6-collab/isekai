import { expect, it } from 'vitest';
import { loadProgress } from './storage';
import { emptyProgress, LEGACY_SAVE_KEY, SAVE_KEY } from './progress';

it('loads an existing v2 save without changing it', () => {
  const raw = JSON.stringify({ ...emptyProgress(), onboarded: true, userName: '継続テスト' });
  const data = new Map([[SAVE_KEY, raw]]);
  const result = loadProgress({ getItem: key => data.get(key) ?? null, setItem: () => { throw new Error('must not write'); } });
  expect(result.progress.userName).toBe('継続テスト');
  expect(result.progress.version).toBe(2);
  expect(result.writable).toBe(true);
});

it('loads and migrates a legacy v1 save when no v2 save exists', () => {
  const legacy = JSON.stringify({
    version: 1,
    userName: '旧調査員',
    onboarded: true,
    discoveredIds: ['001'],
    favorites: ['001'],
    inventory: ['item_nut'],
    buddyId: '001',
    bonds: { '001': 33 },
    readMilestones: [],
    lastRewardDate: '',
    captures: 2
  });
  const data = new Map([[LEGACY_SAVE_KEY, legacy]]);
  const result = loadProgress({ getItem: key => data.get(key) ?? null, setItem: () => {} });
  expect(result.progress.version).toBe(2);
  expect(result.progress.userName).toBe('旧調査員');
  expect(result.progress.discoveredIds).toEqual(['001']);
  expect(result.progress.bonds['001']).toBe(33);
  expect(result.writable).toBe(true);
});

it('backs up a malformed current save before allowing a new one', () => {
  const data = new Map([[SAVE_KEY, '{broken']]);
  const result = loadProgress({ getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); } });
  expect(result.writable).toBe(true);
  expect(result.error).toContain('退避');
  expect(data.get(SAVE_KEY)).toBe('{broken');
  expect(data.size).toBe(2);
});

it('backs up a malformed legacy save before allowing a new one', () => {
  const data = new Map([[LEGACY_SAVE_KEY, '{broken']]);
  const result = loadProgress({ getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); } });
  expect(result.writable).toBe(true);
  expect(result.error).toContain('退避');
  expect(data.get(LEGACY_SAVE_KEY)).toBe('{broken');
  expect(data.size).toBe(2);
});

it('never overwrites an unreadable save when backup storage is full', () => {
  const result = loadProgress({ getItem: () => '{broken', setItem: () => { throw new Error('quota'); } });
  expect(result.writable).toBe(false);
  expect(result.error).toContain('上書きしていません');
});

it('handles browser storage denial without crashing', () => {
  const result = loadProgress({ getItem: () => { throw new Error('denied'); }, setItem: () => {} });
  expect(result.writable).toBe(false);
  expect(result.progress.discoveredIds).toEqual([]);
});
