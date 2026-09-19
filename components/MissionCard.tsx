import React, { useState } from 'react';
import { CheckCircle2, ClipboardList, Lightbulb, Mail } from 'lucide-react';
import { ITEMS } from '../constants';
import { InvestigationMission } from '../data/missions';

interface Props {
  mission: InvestigationMission | null;
  completedCount: number;
  total: number;
  postscript: InvestigationMission | null;
  onAcknowledgePostscript: (id: string) => void;
}

export default function MissionCard({ mission, completedCount, total, postscript, onAcknowledgePostscript }: Props) {
  const [showHint, setShowHint] = useState(false);

  if (postscript) return <section className="rounded-2xl bg-indigo-950 text-white p-4 mb-4 shadow-lg border border-indigo-300/40">
    <div className="flex items-center gap-2 text-indigo-200 text-xs font-black tracking-wider"><Mail size={17} />叔父さんからの追伸</div>
    <h2 className="font-black text-lg mt-2">{postscript.title}：調査完了</h2>
    <p className="text-sm leading-6 mt-2 text-indigo-50">{postscript.postscript}</p>
    <button onClick={() => onAcknowledgePostscript(postscript.id)} className="mt-3 rounded-xl bg-white text-indigo-950 px-4 py-2 text-sm font-black">読んだ</button>
  </section>;

  if (!mission) return <section className="rounded-2xl bg-emerald-950 text-white p-4 mb-4 shadow-lg border border-emerald-300/40">
    <div className="flex items-center gap-2 text-emerald-200 text-xs font-black tracking-wider"><CheckCircle2 size={17} />叔父さんの調査依頼</div>
    <h2 className="font-black text-lg mt-2">今ある依頼はすべて完了！</h2>
    <p className="text-sm leading-6 mt-2">調査依頼 {completedCount} / {total} 件を達成。通常の探索と図鑑集めはそのまま続けられます。</p>
  </section>;

  const item = mission.requiredItemId ? ITEMS.find(i => i.id === mission.requiredItemId) : null;
  return <section className="rounded-2xl bg-[#fffaf2] p-4 mb-4 shadow-sm border-2 border-amber-300">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-amber-800 text-xs font-black tracking-wider"><ClipboardList size={17} />叔父さんの調査依頼</div>
      <span className="text-xs font-bold text-stone-500">{completedCount} / {total}</span>
    </div>
    <h2 className="font-black text-lg text-[#5d4037] mt-2">{mission.title}</h2>
    <ul className="mt-2 space-y-1 text-sm leading-6 text-stone-700">{mission.clues.map((clue, i) => <li key={i}>・{clue}</li>)}</ul>
    {item && !showHint && <p className="text-xs font-bold text-amber-800 mt-3">この依頼には「持ち物」の手がかりもある。</p>}
    {!showHint ? <button onClick={() => setShowHint(true)} className="mt-3 flex items-center gap-2 text-sm font-black text-sky-800 underline underline-offset-4"><Lightbulb size={17} />行き詰まったので追加ヒントを見る</button>
      : <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-200"><p className="text-xs font-black text-amber-800 mb-1">追加ヒント</p><p className="text-sm leading-6">{mission.extraHint}</p></div>}
  </section>;
}
