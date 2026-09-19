import React, { useEffect, useState } from 'react';
import { X, Heart, Star, BookOpen } from 'lucide-react';
import { Creature } from '../types';
import { useDialog } from './useDialog';

interface Props {
  creature: Creature | null; onClose: () => void; isFavorite: boolean; onToggleFavorite: (id: string) => void;
  userName: string; onSetBuddy: (creature: Creature) => void; buddyId: string | null; isLocked?: boolean;
}
export default function CreatureDetailModal({ creature, onClose, isFavorite, onToggleFavorite, onSetBuddy, buddyId, isLocked = false }: Props) {
  const [sketch, setSketch] = useState(false);
  const dialog = useDialog(!!creature);
  useEffect(() => { setSketch(isLocked); }, [creature?.id, isLocked]);
  if (!creature) return null;
  return <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="creature-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
    <div className="relative bg-[#fffaf2] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90dvh] overflow-y-auto">
      <button aria-label="生物の詳細を閉じる" onClick={onClose} className="sticky float-right top-3 right-3 m-3 z-20 p-3 rounded-full bg-white shadow"><X size={22} /></button>
      <div className="p-5 sm:p-8 clear-none">
        <p className="text-xs tracking-widest text-stone-500 font-bold">No.{creature.id} ／ {isLocked ? '未発見・目撃スケッチ' : '観測済み'}</p>
        <h2 id="creature-title" className="font-black text-2xl sm:text-3xl text-[#5d4037] mt-2 pr-8">{creature.name}</h2>
        <p className="text-xs font-serif italic text-stone-500 mt-1">{creature.latinName}</p>
        <div className="grid md:grid-cols-2 gap-6 mt-5">
          <div>
            <img src={sketch ? creature.sketchUrl || creature.imageUrl : creature.imageUrl} alt={creature.name} className="rounded-2xl w-full max-h-[38dvh] md:max-h-[50dvh] object-contain bg-white border-2 border-amber-100" />
            {!isLocked && <div className="flex gap-2 mt-3"><button aria-pressed={!sketch} onClick={() => setSketch(false)} className={`flex-1 p-2 rounded-xl border-2 font-bold text-sm ${!sketch ? 'bg-sky-100 border-sky-500' : 'border-stone-200'}`}>観測写真</button><button aria-pressed={sketch} onClick={() => setSketch(true)} className={`flex-1 p-2 rounded-xl border-2 font-bold text-sm ${sketch ? 'bg-amber-100 border-amber-600' : 'border-stone-200'}`}>スケッチ</button></div>}
            {!isLocked && <div className="flex flex-wrap gap-2 mt-3"><button aria-pressed={isFavorite} onClick={() => onToggleFavorite(creature.id)} className="flex-1 flex justify-center items-center gap-2 rounded-xl p-3 bg-rose-100 text-rose-800 font-bold text-sm"><Heart size={18} className={isFavorite ? 'fill-current' : ''} />{isFavorite ? 'お気に入り解除' : 'お気に入り'}</button><button onClick={() => onSetBuddy(creature)} disabled={buddyId === creature.id} className="flex-1 flex justify-center items-center gap-2 rounded-xl p-3 bg-emerald-100 text-emerald-900 font-bold text-sm"><Star size={18} />{buddyId === creature.id ? 'いまの相棒' : '相棒にする'}</button></div>}
          </div>
          <div className="text-[#5d4037]">
            <dl className="bg-white rounded-2xl p-4 text-sm space-y-3 border border-amber-200"><div><dt className="font-black text-xs text-stone-500">生息地</dt><dd className="mt-1 font-bold">{creature.type}</dd></div><div><dt className="font-black text-xs text-stone-500">観測できる時間</dt><dd className="mt-1 font-bold">{creature.activeTime.join('・')}</dd></div></dl>
            {isLocked ? <p className="text-sm leading-7 my-5">叔父さんの目撃スケッチです。この場所と時間を手がかりに探索しよう。撮影に成功すると、生態や博士の記録が読めるようになります。</p> : <>
              <p className="text-sm leading-7 whitespace-pre-wrap my-5 font-medium">{creature.shortDesc}</p>
              <h3 className="flex gap-2 items-center font-black border-t border-amber-200 pt-4"><BookOpen size={18} />博士の観測ノート</h3>
              <ul className="mt-3 space-y-3 text-sm leading-6">{creature.trivia.map((note, i) => <li key={i} className="bg-amber-50 p-3 rounded-xl">{note}</li>)}</ul>
            </>}
          </div>
        </div>
      </div>
    </div>
  </div>;
}
