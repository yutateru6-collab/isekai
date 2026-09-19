import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Upload } from 'lucide-react';
import { Progress, parseProgress } from '../services/progress';
import { localDate } from '../services/game';
import { useDialog } from './useDialog';
export default function SettingsModal({ progress, onRestore, onClose }: { progress: Progress; onRestore: (p: Progress) => void; onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const dialog = useDialog(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<Progress | null>(null);
  const [build, setBuild] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    fetch('/build-info.json', { cache: 'no-store', signal: abort.signal }).then(r => r.ok ? r.json() : null).then(v => { if (typeof v?.commit === 'string') setBuild(v.commit.slice(0, 12)); }).catch(() => {});
    return () => abort.abort();
  }, []);
  const exportUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(progress, null, 2))}`;
  return <div ref={dialog} className="fixed inset-0 z-[100] bg-black/60 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <div className="bg-[#fffdf7] rounded-3xl p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto shadow-2xl relative">
      <button onClick={onClose} aria-label="設定を閉じる" className="absolute right-3 top-3 icon-action"><X size={22} /></button>
      <p className="field-eyebrow pr-10">RESEARCHER SETTINGS</p><h2 id="settings-title" className="text-xl font-black mt-2 mb-4 pr-8">調査員の設定</h2>
      <p className="font-bold text-sm">{progress.userName} 調査員</p>
      <p className="text-xs leading-6 my-4 text-stone-600">進捗はこの端末・このブラウザに保存されます。端末や公開URLを変える前に、バックアップを保管してください。</p>
      <a href={exportUrl} download={`isekai-save-${localDate()}.json`} className="action-primary"><Download size={19} />保存データを書き出す</a>
      <button onClick={() => input.current?.click()} className="action-secondary mt-3"><Upload size={19} />保存データを読み込む</button>
      <input ref={input} aria-label="保存データのファイル" type="file" accept=".json,application/json" className="hidden" onChange={async e => {
        const file = e.target.files?.[0]; e.target.value = '';
        if (!file) return;
        setError(''); setPending(null);
        try {
          if (file.size > 1_000_000) throw new Error('ファイルが大きすぎます。');
          setPending(parseProgress(await file.text()));
        } catch (err) { setError(err instanceof Error ? err.message : '読み込みに失敗しました。'); }
      }} />
      {error && <p role="alert" className="text-red-800 text-sm mt-3">{error}</p>}
      {pending && <div className="border border-amber-300 bg-amber-50 p-4 rounded-xl mt-4"><p className="font-bold text-sm">{pending.userName} ／ 発見 {pending.discoveredIds.length}種</p><p className="text-xs leading-6 my-2">現在の進捗を置き換えます。必要なら先に書き出してください。</p><button className="action-primary" onClick={() => { onRestore(pending); onClose(); }}>このデータで復元</button><button className="action-text" onClick={() => setPending(null)}>やめる</button></div>}
      <details className="settings-guide"><summary>遊び方を確認する</summary><p>① 叔父さんの依頼から、場所と時間を考える。<br />② 景色の中の番号か痕跡の一覧を選ぶ。<br />③ 見えた特徴を読み、静かに近づいて観察する。<br />④ 光が白い線に重なったらタップして撮影。<br />⑤ 図鑑から相棒とお気に入りを選ぶ。</p><p>調査には時間制限がありません。撮影も「ゆっくり撮影」にすると、光が線の上で待ってくれます。</p><p>相棒との思い出、生態の観測記録、依頼の追伸は読み返せます。通常のふれあいで絆が深まるのは、相棒を替えても1日合計3回です。</p><p>5種類で未確認エリアが開き、33種類で図鑑完成。位置情報・カメラ・アカウント登録は不要です。</p></details>
      <details className="settings-guide"><summary>保存について</summary><p>ブラウザのデータ削除やプライベートブラウズ終了で、保存が消える場合があります。違う公開URLの保存は共有されません。</p><p>以前の保存形式（v1）も読み込めます。新形式（v2）への移行時、古いキーの元データは削除しません。</p></details>
      <p className="settings-build">SAVE v2 {build ? `／ BUILD ${build}` : ''}</p>
    </div>
  </div>;
}
