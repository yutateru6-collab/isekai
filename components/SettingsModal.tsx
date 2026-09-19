import React, { useRef, useState } from 'react';
import { X, Download, Upload } from 'lucide-react';
import { Progress, parseProgress } from '../services/progress';
import { useDialog } from './useDialog';

export default function SettingsModal({ progress, onRestore, onClose }: { progress: Progress; onRestore: (p: Progress) => void; onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const dialog = useDialog(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<Progress | null>(null);
  const exportUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(progress, null, 2))}`;
  return <div ref={dialog} className="fixed inset-0 z-[100] bg-black/60 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="settings-title">
    <div className="bg-[#fffaf2] text-kids-text rounded-3xl p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto shadow-2xl relative">
      <button onClick={onClose} aria-label="設定を閉じる" className="absolute right-4 top-4 p-2"><X /></button>
      <h2 id="settings-title" className="text-xl font-black mb-4">調査員の設定</h2>
      <p className="font-bold">{progress.userName} 調査員</p>
      <p className="text-sm leading-6 my-4">進捗はこの端末・このブラウザに自動保存されます。別の端末や別の公開URLに移るとき、ブラウザのデータを消す前は、バックアップを保管してください。</p>
      <a href={exportUrl} download={`isekai-save-${new Date().toISOString().slice(0, 10)}.json`} className="w-full rounded-xl bg-slate-800 text-white p-3 font-bold flex justify-center gap-2"><Download size={20} />保存データを書き出す</a>
      <button onClick={() => input.current?.click()} className="w-full rounded-xl border-2 border-slate-300 p-3 font-bold mt-3 flex justify-center gap-2"><Upload size={20} />保存データを読み込む</button>
      <input ref={input} aria-label="保存データのファイル" type="file" accept=".json,application/json" className="hidden" onChange={async e => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setError(''); setPending(null);
        try {
          if (file.size > 1_000_000) throw new Error('ファイルが大きすぎます。');
          setPending(parseProgress(await file.text()));
        } catch (err) { setError(err instanceof Error ? err.message : '読み込みに失敗しました。'); }
      }} />
      {error && <p role="alert" className="text-red-700 text-sm mt-3">{error}</p>}
      {pending && <div className="border-2 border-amber-400 bg-amber-50 p-4 rounded-xl mt-4">
        <p className="font-bold">{pending.userName}／発見 {pending.discoveredIds.length} 種</p>
        <p className="text-sm my-2">現在の進捗を、このデータに置き換えます。必要なら先に書き出してください。</p>
        <div className="flex gap-2"><button className="rounded-lg bg-slate-800 text-white px-4 py-2" onClick={() => { onRestore(pending); onClose(); }}>このデータで復元</button><button className="px-3 py-2" onClick={() => setPending(null)}>やめる</button></div>
      </div>}
      <div className="border-t border-amber-200 mt-6 pt-4 text-sm leading-6">
        <h3 className="font-black mb-2">遊び方</h3>
        <p>① 場所と観測時間を選ぶ<br />② ルートをたどって生物を探す<br />③ 光が線に重なったらタップして撮影<br />④ 図鑑から相棒とお気に入りを選ぶ</p>
        <p className="mt-3">5種類で未確認エリアが開きます。全種類を記録して、叔父さんの帰り道を完成させよう。</p>
        <p className="mt-3 text-gray-500">アプリ内だけで探索できます。位置情報・カメラ・アカウント登録は不要です。</p>
      </div>
    </div>
  </div>;
}
