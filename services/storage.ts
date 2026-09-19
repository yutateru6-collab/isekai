import { emptyProgress, parseProgress, SAVE_KEY } from './progress';
type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>;
export function loadProgress(storage: SaveStorage) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return { progress: emptyProgress(), error: '', writable: true };
    try { return { progress: parseProgress(raw), error: '', writable: true }; }
    catch {
      storage.setItem(`${SAVE_KEY}-recovery-${Date.now()}`, raw);
      return { progress: emptyProgress(), error: '保存データを読み取れませんでした。元のデータは端末内に退避しました。バックアップがあれば「設定」から復元できます。', writable: true };
    }
  } catch {
    // If the old save cannot be read or backed up, never overwrite it automatically.
    return { progress: emptyProgress(), error: '保存領域を利用できません。元の保存データは上書きしていません。「設定」から書き出して保管するか、バックアップを復元してください。', writable: false };
  }
}
