import { useEffect, useReducer, useState } from 'react';
import { Action, emptyProgress, progressReducer, SAVE_KEY } from './progress';
import { loadProgress } from './storage';

function load() {
  try {
    return loadProgress(localStorage);
  } catch {
    return { progress: emptyProgress(), error: 'このブラウザでは自動保存を利用できません。「設定」から保存データを書き出してください。', writable: false };
  }
}

export function useProgress() {
  const [initial] = useState(load);
  const [progress, reduce] = useReducer(progressReducer, initial.progress);
  const [writable, setWritable] = useState(initial.writable);
  const [saveError, setSaveError] = useState(initial.error);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!writable) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
      setSaved(true);
    } catch {
      setSaved(false);
      setSaveError('自動保存できませんでした。「設定」から保存データを書き出して保管してください。');
    }
  }, [progress, writable]);
  function dispatch(action: Action) {
    if (action.type === 'restore') { setWritable(true); setSaveError(''); }
    reduce(action);
  }
  return { progress, dispatch, saveError, saved, dismissError: () => setSaveError('') };
}
