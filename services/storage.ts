import { emptyProgress, LEGACY_SAVE_KEY, parseProgress, SAVE_KEY } from './progress';

type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>;

function recoverMalformed(storage: SaveStorage, key: string, raw: string) {
  storage.setItem(`${key}-recovery-${Date.now()}`, raw);
  return {
    progress: emptyProgress(),
    error: '保存データを読み取れませんでした。元のデータは端末内に退避しました。バックアップがあれば「設定」から復元できます。',
    writable: true
  };
}

export function loadProgress(storage: SaveStorage) {
  try {
    const current = storage.getItem(SAVE_KEY);
    if (current) {
      try { return { progress: parseProgress(current), error: '', writable: true }; }
      catch {
        try { return recoverMalformed(storage, SAVE_KEY, current); }
        catch {
          return { progress: emptyProgress(), error: '保存領域を利用できません。元の保存データは上書きしていません。「設定」から書き出して保管するか、バックアップを復元してください。', writable: false };
        }
      }
    }

    const legacy = storage.getItem(LEGACY_SAVE_KEY);
    if (!legacy) return { progress: emptyProgress(), error: '', writable: true };
    try {
      return {
        progress: parseProgress(legacy),
        error: '',
        writable: true
      };
    } catch {
      try { return recoverMalformed(storage, LEGACY_SAVE_KEY, legacy); }
      catch {
        return { progress: emptyProgress(), error: '保存領域を利用できません。元の保存データは上書きしていません。「設定」から書き出して保管するか、バックアップを復元してください。', writable: false };
      }
    }
  } catch {
    return { progress: emptyProgress(), error: '保存領域を利用できません。元の保存データは上書きしていません。「設定」から書き出して保管するか、バックアップを復元してください。', writable: false };
  }
}
