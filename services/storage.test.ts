import { expect, it } from 'vitest';
import { loadProgress } from './storage';
import { emptyProgress, SAVE_KEY } from './progress';

it('loads an existing save without changing it', () => {
  const raw = JSON.stringify({ ...emptyProgress(), onboarded: true, userName: '継続テスト' });
  const result = loadProgress({ getItem: () => raw, setItem: () => { throw new Error('must not write'); } });
  expect(result.progress.userName).toBe('継続テスト'); expect(result.writable).toBe(true);
});
it('backs up a malformed save before allowing a new one', () => {
  const data = new Map([[SAVE_KEY, '{broken']]);
  const result = loadProgress({ getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); } });
  expect(result.writable).toBe(true); expect(result.error).toContain('退避');
  expect(data.get(SAVE_KEY)).toBe('{broken'); expect(data.size).toBe(2);
});
it('never overwrites an unreadable save when backup storage is full', () => {
  const result = loadProgress({ getItem: () => '{broken', setItem: () => { throw new Error('quota'); } });
  expect(result.writable).toBe(false); expect(result.error).toContain('上書きしていません');
});
it('handles browser storage denial without crashing', () => {
  const result = loadProgress({ getItem: () => { throw new Error('denied'); }, setItem: () => {} });
  expect(result.writable).toBe(false); expect(result.progress.discoveredIds).toEqual([]);
});
