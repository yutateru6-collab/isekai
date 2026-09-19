import React, { useEffect, useState } from 'react';
import { X, Heart, Star, BookOpen } from 'lucide-react';
import { Creature } from '../types';
import { useDialog } from './useDialog';
import { anonymousName } from '../services/field';
import { BEHAVIOR_VARIANTS } from '../data/behaviors';
import CatalogImage from './CatalogImage';
interface Props {
  creature: Creature | null; onClose: () => void; isFavorite: boolean; onToggleFavorite: (id: string) => void;
  userName: string; onSetBuddy: (creature: Creature) => void; buddyId: string | null; isLocked?: boolean; observedIds?: string[];
}
export default function CreatureDetailModal({ creature, onClose, isFavorite, onToggleFavorite, onSetBuddy, buddyId, isLocked = false, observedIds = [] }: Props) {
  const [sketch, setSketch] = useState(false);
  const dialog = useDialog(!!creature);
  useEffect(() => { setSketch(isLocked); }, [creature?.id, isLocked]);
  if (!creature) return null;
  const label = isLocked ? anonymousName(creature.id) : creature.name;
  const variants = BEHAVIOR_VARIANTS[creature.id] ?? [];
  return <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="creature-title" className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
    <div className="relative bg-[#fffdf7] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90dvh] overflow-y-auto">
      <button aria-label="生物の詳細を閉じる" onClick={onClose} className="sticky float-right top-3 right-3 m-3 z-20 icon-action bg-white shadow"><X size={22} /></button>
      <div className="p-5 sm:p-8 clear-none">
        <p className="field-eyebrow">No.{creature.id} ／ {isLocked ? '目撃スケッチ・正体不明' : 'OBSERVED'}</p>
        <h2 id="creature-title" className="font-black text-2xl sm:text-3xl mt-2 pr-8">{label}</h2>
        {!isLocked && <p className="text-xs font-serif italic text-stone-500 mt-1">{creature.latinName}</p>}
        <div className="grid md:grid-cols-2 gap-6 mt-5"><div>
          <CatalogImage eager src={isLocked || sketch ? creature.sketchUrl || creature.imageUrl : creature.imageUrl} alt={label} />
          {!isLocked && <div className="flex gap-2 mt-3"><button aria-pressed={!sketch} onClick={() => setSketch(false)} className="action-secondary">観測写真</button><button aria-pressed={sketch} onClick={() => setSketch(true)} className="action-secondary">スケッチ</button></div>}
          {!isLocked && <div className="flex flex-wrap gap-2 mt-3"><button aria-pressed={isFavorite} onClick={() => onToggleFavorite(creature.id)} className="flex-1 action-secondary"><Heart size={17} className={isFavorite ? 'fill-current' : ''} />{isFavorite ? 'お気に入り解除' : 'お気に入り'}</button><button onClick={() => onSetBuddy(creature)} disabled={buddyId === creature.id} className="flex-1 action-primary"><Star size={17} />{buddyId === creature.id ? 'いまの相棒' : '相棒にする'}</button></div>}
        </div><div className="select-text">
          <dl className="bg-[#f0f3e8] rounded-2xl p-4 text-sm space-y-3 border border-[#dfe4cf]"><div><dt className="font-black text-xs text-stone-500">生息地</dt><dd className="mt-1 font-bold">{creature.type}</dd></div><div><dt className="font-black text-xs text-stone-500">観測できる時間</dt><dd className="mt-1 font-bold">{creature.activeTime.join('・')}</dd></div></dl>
          {isLocked ? <p className="text-sm leading-7 my-5">叔父さんの目撃スケッチです。この場所と時間を手がかりに、景色の中の痕跡を調べよう。撮影に成功すると名前と生態がわかります。</p> : <>
            <p className="text-sm leading-7 whitespace-pre-wrap my-5">{creature.shortDesc}</p>
            <h3 className="flex gap-2 items-center font-black border-t border-[#dfe4cf] pt-4"><BookOpen size={18} />博士の観測ノート</h3>
            <ul className="mt-3 space-y-3 text-sm leading-6">{creature.trivia.map((note, i) => <li key={i} className="bg-[#f4f3e8] p-3 rounded-xl">{note}</li>)}</ul>
            {variants.length > 0 && <section className="detail-ecology"><h3>再観測で見つけた生態 {observedIds.length} / {variants.length}</h3>{observedIds.length === 0 && <p>同じ生物の別の行動が、まだ見つかりそうだ。</p>}{variants.map(v => observedIds.includes(v.id) ? <article key={v.id}><strong>{v.label}</strong><p>{v.description}</p></article> : <p key={v.id}>未記録の行動 ／ もう一度観察しよう</p>)}</section>}
          </>}
        </div></div>
      </div>
    </div>
  </div>;
}
