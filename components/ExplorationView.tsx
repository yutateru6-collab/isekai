import React, { useEffect, useRef, useState } from 'react';
import { Creature, SearchArea, Item, TimeOfDay, NewsData } from '../types';
import { SEARCH_AREAS } from '../constants';
import { Radar, X, Box, MapPin, ArrowLeft, Lock } from 'lucide-react';
import { eligibleCreatures, MYSTERY_UNLOCK } from '../services/game';
import { InvestigationMission, missionBoostAvailable } from '../data/missions';
import { BehaviorObservation, nextBehaviorVariant } from '../data/behaviors';
import BuddyView from './BuddyView';
import AmidakujiView, { Reward } from './AmidakujiView';
import RhythmCapture from './RhythmCapture';

interface Props {
  showNews: boolean;
  setShowNews: (show: boolean) => void;
  newsMessage: NewsData;
  activeMission: InvestigationMission | null;
  buddy: Creature | null;
  buddyMemories: string[];
  petCountToday: number;
  inventory: Item[];
  setShowInventory: (show: boolean) => void;
  timeConfig: { label: string; icon: React.ElementType };
  currentTime: TimeOfDay;
  onTimeChange: (time: TimeOfDay) => void;
  handleBuddyInteraction: (e: React.MouseEvent) => void;
  discoveredIds: string[];
  observations: Record<string, string[]>;
  onCapture: (id: string, behaviorVariantId?: string) => void;
  onFindItem: (id: string) => void;
  onStartExpedition: (areaId: string) => void;
  onCreatureClick: (c: Creature) => void;
  activeArea: SearchArea | null;
  onAreaSelect: (area: SearchArea | null) => void;
}

export default function ExplorationView(p: Props) {
  const [menu, setMenu] = useState(false);
  const [phase, setPhase] = useState<'route' | 'scanning' | 'capture' | 'result' | 'escaped'>('route');
  const [reward, setReward] = useState<Reward | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [observedBehavior, setObservedBehavior] = useState<BehaviorObservation | null>(null);
  const [trip, setTrip] = useState(0);
  const completionHandled = useRef(false);
  const creature = reward?.type === 'creature' ? reward.data as Creature : null;
  const item = reward?.type === 'item' ? reward.data as Item : null;

  useEffect(() => {
    if (phase !== 'scanning') return;
    const timer = setTimeout(() => setPhase('capture'), 1200);
    return () => clearTimeout(timer);
  }, [phase]);

  function start(area: SearchArea) {
    if (area.id === 'mystery' && p.discoveredIds.length < MYSTERY_UNLOCK) return;
    p.onStartExpedition(area.id);
    p.onAreaSelect(area);
    setPhase('route');
    setReward(null);
    setObservedBehavior(null);
    setTrip(n => n + 1);
    completionHandled.current = false;
  }

  function finishRoute(found: Reward) {
    if (completionHandled.current) return;
    completionHandled.current = true;
    setReward(found);
    setObservedBehavior(null);
    if (found.type === 'creature' && found.data) {
      setDuplicate(p.discoveredIds.includes(found.data.id));
      setPhase('scanning');
    } else {
      if (found.type === 'item' && found.data) p.onFindItem(found.data.id);
      setPhase('result');
    }
  }

  function quit() {
    p.onAreaSelect(null);
    setReward(null);
    setObservedBehavior(null);
    setPhase('route');
  }

  if (p.activeArea) {
    const inventoryIds = p.inventory.map(i => i.id);
    const missionBoost = missionBoostAvailable(p.activeMission, p.activeArea.id, p.currentTime, inventoryIds);
    return <div className="fixed inset-0 z-40 bg-slate-950 overflow-y-auto font-maru">
      {phase === 'route' && <AmidakujiView
        key={trip}
        areaId={p.activeArea.id}
        time={p.currentTime}
        discoveredIds={p.discoveredIds}
        rareBonus={p.newsMessage.bonusAreaId === p.activeArea.id || p.inventory.some(i => i.id === p.newsMessage.luckyItemId)}
        missionTargetId={p.activeMission?.targetCreatureId}
        missionBoost={missionBoost}
        onComplete={finishRoute}
        onClose={quit}
      />}
      {phase === 'scanning' && <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center text-white gap-6"><Radar size={96} className="text-emerald-400 animate-pulse" /><h2 className="text-3xl font-black">生体反応を発見！</h2><p>パラレル・カムを準備しています</p><button className="underline p-3" onClick={quit}>ホームへ戻る</button></div>}
      {phase === 'capture' && creature && <RhythmCapture creature={creature} onCapture={() => {
        const behavior = duplicate ? nextBehaviorVariant(creature.id, p.observations[creature.id] ?? []) : null;
        setObservedBehavior(behavior);
        p.onCapture(creature.id, behavior?.id);
        setPhase('result');
      }} onEscape={() => setPhase('escaped')} />}
      {(phase === 'result' || phase === 'escaped') && <div className="min-h-[100dvh] p-5 flex items-center justify-center" style={{ background: `linear-gradient(#0007,#000a),url('${p.activeArea.fpsImage}') center / cover` }}>
        <div className="bg-[#fffaf2] w-full max-w-sm rounded-3xl p-6 text-center border-4 border-white shadow-2xl">
          <h2 className="font-black text-2xl text-[#5d4037] mb-4">
            {phase === 'escaped' ? 'もう一度、落ち着いて' : creature ? observedBehavior ? '新しい生態を観測！' : duplicate ? '再観測成功！' : '新しい生物を発見！' : item ? 'アイテム発見！' : '今は静かなようだ'}
          </h2>
          {creature && <><img src={creature.imageUrl} alt={creature.name} className="w-full aspect-square max-h-[35dvh] object-contain rounded-xl bg-white" /><h3 className="font-black text-xl mt-3">{creature.name}</h3></>}
          {observedBehavior && <div className="mt-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 p-3 text-left"><p className="font-black text-emerald-800">{observedBehavior.label}</p><p className="text-sm leading-6 mt-1">{observedBehavior.description}</p></div>}
          {item && <><div className="text-6xl my-5">{item.icon}</div><h3 className="font-black text-xl">{item.name}</h3><p className="text-sm mt-2">{item.description}</p></>}
          <p className="text-sm text-stone-600 my-4">{phase === 'escaped' ? '光が白い線に重なる瞬間にタップ。時間制限のない「ゆっくり撮影」も選べます。' : creature ? observedBehavior ? '再観測で新しい行動を記録できた。図鑑100%とは別に、生態の発見が積み上がります。' : duplicate ? '観測のお礼にパラレルナッツをもらった！' : '図鑑に記録して、迷子を元の世界へ送り届けました。' : item ? 'バッグに入れました。相棒に渡してみよう。' : '別のルートや時間を試してみよう。'}</p>
          {phase === 'escaped' && <button onClick={() => setPhase('capture')} className="w-full bg-emerald-700 text-white rounded-xl p-3 font-bold mb-2">撮影をやり直す</button>}
          {phase === 'result' && creature && <button onClick={() => { quit(); p.onCreatureClick(creature); }} className="w-full bg-sky-700 text-white rounded-xl p-3 font-bold mb-2">図鑑で詳しく見る</button>}
          <button onClick={() => start(p.activeArea!)} className="w-full bg-amber-100 text-[#5d4037] rounded-xl p-3 font-bold mb-2">このエリアをもう一度探索</button>
          <button onClick={quit} className="w-full p-3 font-bold underline">ホームへ戻る</button>
        </div>
      </div>}
    </div>;
  }

  return <div className="relative">
    {!p.activeMission && p.showNews && <div className="mb-4 bg-slate-900 text-white p-4 rounded-2xl flex items-start gap-3"><Radar className="text-emerald-400 shrink-0" /><div className="flex-1"><h3 className="text-emerald-300 text-xs font-bold mb-1">{p.newsMessage.title}</h3><p className="text-sm leading-6">{p.newsMessage.content}</p></div><button aria-label="予報を閉じる" onClick={() => p.setShowNews(false)}><X size={18} /></button></div>}
    <BuddyView buddy={p.buddy} memoryLabels={p.buddyMemories} dailyPetCount={p.petCountToday} onBuddyInteraction={p.handleBuddyInteraction} onOpenInventory={e => { e.stopPropagation(); p.setShowInventory(true); }} />
    {!p.buddy && <button onClick={() => p.setShowInventory(true)} className="w-full mb-4 bg-white/95 p-3 rounded-xl font-bold flex justify-center gap-2"><Box size={20} />バッグ（{p.inventory.length}）</button>}
    {!menu ? <div className="min-h-[32dvh] flex flex-col justify-center items-center py-8">
      <button onClick={() => setMenu(true)} className="bg-[#fffaf2] rounded-3xl border-4 border-white px-10 py-6 shadow-pop hover:-translate-y-1 transition-transform text-[#5d4037] flex flex-col items-center gap-2"><MapPin size={44} /><span className="font-black text-2xl">調査に出発</span><span className="text-xs">いつもの場所に、未知の気配。</span></button>
    </div> : <section className="bg-[#fffaf2]/95 rounded-3xl p-4 sm:p-6 border-2 border-white mb-6">
      <div className="flex items-center gap-2 mb-4"><button aria-label="エリア選択を閉じる" className="p-2" onClick={() => setMenu(false)}><ArrowLeft /></button><h2 className="text-xl font-black">探索エリアを選択</h2></div>
      <label htmlFor="observation-time" className="font-bold text-sm block mb-2">観測する時間</label>
      <select id="observation-time" value={p.currentTime} onChange={e => p.onTimeChange(e.target.value as TimeOfDay)} className="w-full p-3 rounded-xl border-2 border-amber-300 bg-white font-bold">
        {[TimeOfDay.Morning, TimeOfDay.Day, TimeOfDay.Sunset, TimeOfDay.Night].map(time => <option key={time}>{time}</option>)}
      </select>
      <p className="text-xs text-stone-600 mt-2 mb-4">パラレル・カムなら別の時間帯も観測できます。実際に外出する必要はありません。</p>
      <div className="grid sm:grid-cols-2 gap-3">{SEARCH_AREAS.map(area => {
        const locked = area.id === 'mystery' && p.discoveredIds.length < MYSTERY_UNLOCK;
        const pool = eligibleCreatures(area.id, p.currentTime, p.discoveredIds);
        const unseen = pool.filter(c => !p.discoveredIds.includes(c.id)).length;
        return <button key={area.id} disabled={locked} onClick={() => start(area)} className={`text-left relative p-4 rounded-2xl border-2 bg-white overflow-hidden disabled:opacity-60 ${area.color.split(' ')[2]}`}>
          <img src={area.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
          <div className="relative"><div className="flex items-center gap-2"><area.icon size={26} /><h3 className="font-black">{area.label}</h3></div><p className="text-xs leading-5 mt-2">{area.description}</p><p className="text-xs font-bold mt-3">{locked ? <span className="flex gap-1"><Lock size={14} />あと{MYSTERY_UNLOCK - p.discoveredIds.length}種類で解放</span> : pool.length ? `${p.currentTime}の生体反応 ${pool.length}種 ／ 未発見 ${unseen}種` : '今は生体反応なし・アイテムを探せます'}</p></div>
        </button>;
      })}</div>
    </section>}
  </div>;
}
