import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Creature } from '../types';
import { useDialog } from './useDialog';
import { anonymousName } from '../services/field';
export default function RealisticBook({ creatures, discoveredIds, onClose }: { creatures: Creature[]; discoveredIds: string[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 900px)').matches);
  const dialog = useDialog(true);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px)');
    const update = () => setWide(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const step = wide ? 2 : 1;
  const start = Math.floor(index / step) * step;
  return <div ref={dialog} role="dialog" aria-modal="true" aria-label="異世界生物図鑑" className="fixed inset-0 z-50 bg-black/90 p-3 sm:p-6 flex flex-col items-center justify-center font-serif">
    <div className="flex items-center gap-3 w-full max-w-5xl mb-3 text-white"><h2 className="font-bold flex-1 text-sm sm:text-lg">異世界 観測ログ <span className="text-xs text-amber-200 ml-2">{discoveredIds.length}/{creatures.length}種</span></h2><button onClick={onClose} aria-label="図鑑を閉じる" className="icon-action bg-white/10"><X size={22} /></button></div>
    <div className="w-full max-w-5xl flex min-h-0 h-[72dvh] bg-[#f5e6d3] rounded-lg border-[6px] border-[#5d4037] shadow-2xl overflow-hidden">
      {creatures.slice(start, start + step).map((c, i) => {
        const found = discoveredIds.includes(c.id);
        const label = found ? c.name : anonymousName(c.id);
        return <article key={c.id} className={`flex-1 min-w-0 overflow-y-auto p-5 sm:p-7 select-text ${i ? 'border-l-2 border-[#c7a47e]' : ''}`} style={{ background: "linear-gradient(#f5e6d3cc,#f5e6d3cc),url('/image/parchment.png') center / cover" }}>
          <div className="flex justify-between text-xs text-stone-600"><span>No.{c.id}</span><span>{found ? '観測済み' : '未発見・調査対象'}</span></div>
          <h3 className="font-black text-2xl text-[#5d4037] mt-2 mb-3">{label}</h3>
          <img src={found ? c.imageUrl : c.sketchUrl || c.imageUrl} alt={label} className={`w-full h-[28dvh] object-contain bg-white/70 p-2 shadow rounded-sm ${found ? '' : 'sepia'}`} />
          <p className="text-sm leading-7 whitespace-pre-wrap my-4 text-[#5d4037]">{found ? c.shortDesc : '目撃情報をもとにしたスケッチ。この場所と時間に、生物の気配がある。撮影に成功すると名前がわかる。'}</p>
          <div className="text-xs font-bold leading-6 border-t border-[#c7a47e] pt-3 text-[#5d4037]">生息地：{c.type}<br />観測時間：{c.activeTime.join('・')}</div>
          {found && <p className="text-xs leading-6 mt-3 italic text-stone-600">{c.trivia[0]}</p>}
          <p className="text-right text-xs text-stone-500 mt-4">p.{start + i + 1}</p>
        </article>;
      })}
    </div>
    <nav aria-label="図鑑のページ" className="w-full max-w-5xl flex items-center justify-between gap-3 mt-3 text-white"><button aria-label="前のページ" disabled={start === 0} onClick={() => setIndex(Math.max(0, start - step))} className="icon-action bg-white/10 disabled:opacity-30"><ChevronLeft /></button><label className="flex items-center gap-2 text-xs">ページ<select aria-label="図鑑のページを選ぶ" value={index} onChange={e => setIndex(Number(e.target.value))} className="bg-[#fffaf2] text-[#5d4037] max-w-[55vw] rounded-lg p-2">{creatures.map((c, i) => <option value={i} key={c.id}>{i + 1}. {discoveredIds.includes(c.id) ? c.name + ' ✓' : anonymousName(c.id)}</option>)}</select></label><button aria-label="次のページ" disabled={start + step >= creatures.length} onClick={() => setIndex(start + step)} className="icon-action bg-white/10 disabled:opacity-30"><ChevronRight /></button></nav>
  </div>;
}
