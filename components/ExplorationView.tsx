import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, Compass, Lock, Moon, ScanLine, Sun, Sunrise, Sunset, X } from 'lucide-react';
import { Creature, Item, NewsData, SearchArea, TimeOfDay } from '../types';
import { SEARCH_AREAS } from '../constants';
import { eligibleCreatures, MYSTERY_UNLOCK } from '../services/game';
import { createFieldSpots, FieldSpot } from '../services/field';
import { InvestigationMission, missionConditionsMet } from '../data/missions';
import { BehaviorObservation, nextBehaviorVariant } from '../data/behaviors';
import FieldObservationView from './FieldObservationView';
import RhythmCapture from './RhythmCapture';
import { useDialog } from './useDialog';

interface Props {
  newsMessage: NewsData;
  activeMission: InvestigationMission | null;
  inventory: Item[];
  currentTime: TimeOfDay;
  onTimeChange: (time: TimeOfDay) => void;
  discoveredIds: string[];
  observations: Record<string, string[]>;
  onCapture: (id: string, behaviorVariantId?: string) => void;
  onFindItem: (id: string) => void;
  onStartExpedition: (areaId: string) => void;
  onCreatureClick: (c: Creature) => void;
  activeArea: SearchArea | null;
  onAreaSelect: (area: SearchArea | null) => void;
  menuOpen: boolean;
  onMenuChange: (open: boolean) => void;
}
const TIMES = [TimeOfDay.Morning, TimeOfDay.Day, TimeOfDay.Sunset, TimeOfDay.Night];
const TIME_ICONS = [Sunrise, Sun, Sunset, Moon];

export default function ExplorationView(p: Props) {
  const [phase, setPhase] = useState<'survey' | 'approaching' | 'capture' | 'result' | 'escaped'>('survey');
  const [spots, setSpots] = useState<FieldSpot[]>([]);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [found, setFound] = useState<FieldSpot | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [behavior, setBehavior] = useState<BehaviorObservation | null>(null);
  const [completedTitle, setCompletedTitle] = useState('');
  const [trip, setTrip] = useState(0);
  const busy = useRef(false);
  const captured = useRef(false);
  const dialog = useDialog(p.menuOpen || !!p.activeArea);
  const creature = found?.reward.type === 'creature' ? found.reward.data : null;
  const item = found?.reward.type === 'item' ? found.reward.data : null;

  useEffect(() => {
    if (phase !== 'approaching') return;
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    const timer = setTimeout(() => setPhase('capture'), delay);
    return () => clearTimeout(timer);
  }, [phase]);

  function start(area: SearchArea) {
    const nextSpots = createFieldSpots(area.id, p.currentTime, p.discoveredIds, p.inventory.map(i => i.id), p.activeMission,
      p.newsMessage.bonusAreaId === area.id || p.inventory.some(i => i.id === p.newsMessage.luckyItemId));
    if (!nextSpots.length) return;
    p.onStartExpedition(area.id);
    p.onAreaSelect(area);
    p.onMenuChange(false);
    setSpots(nextSpots); setResolvedIds([]); setFound(null); setBehavior(null); setCompletedTitle(''); setPhase('survey'); setTrip(n => n + 1);
    busy.current = false; captured.current = false;
  }
  function quit(toMenu = false) {
    p.onAreaSelect(null); p.onMenuChange(toMenu); setPhase('survey'); setFound(null); busy.current = false;
  }
  function inspect(spot: FieldSpot) {
    if (busy.current || resolvedIds.includes(spot.id) || phase !== 'survey') return;
    busy.current = true; captured.current = false;
    setFound(spot); setBehavior(null); setCompletedTitle('');
    if (spot.reward.type === 'item') {
      p.onFindItem(spot.reward.data.id);
      setResolvedIds(ids => [...ids, spot.id]); setPhase('result');
    } else {
      setDuplicate(p.discoveredIds.includes(spot.reward.data.id)); setPhase('approaching');
    }
  }
  function capture() {
    if (!creature || !found || captured.current) return;
    captured.current = true;
    const next = duplicate ? nextBehaviorVariant(creature.id, p.observations[creature.id] ?? []) : null;
    setBehavior(next);
    if (p.activeMission && p.activeArea && missionConditionsMet(p.activeMission, creature.id, p.activeArea.id, p.currentTime, p.inventory.map(i => i.id))) setCompletedTitle(p.activeMission.title);
    p.onCapture(creature.id, next?.id);
    setResolvedIds(ids => ids.includes(found.id) ? ids : [...ids, found.id]); setPhase('result');
  }
  function resumeSurvey() { busy.current = false; setFound(null); setPhase('survey'); }

  if (!p.menuOpen && !p.activeArea) return null;
  return <div ref={dialog} role="dialog" aria-modal="true" aria-label={p.activeArea ? 'フィールド調査' : '探索エリアを選択'} className="survey-overlay" onKeyDown={e => { if (e.key === 'Escape' && phase !== 'capture') { e.stopPropagation(); quit(); } }}>
    <div className="survey-topbar"><div className="survey-topbar-inner">
      <button className="icon-action" aria-label={p.activeArea ? 'エリアを選び直す' : 'ホームに戻る'} onClick={() => quit(!!p.activeArea)}><ArrowLeft size={22} /></button>
      <div className="survey-place"><span className="field-eyebrow">{p.activeArea ? 'FIELD OBSERVATION' : 'PLAN YOUR RESEARCH'}</span><h1>{p.activeArea?.label ?? 'どこを調べる？'}</h1></div>
      {p.activeArea && <span className="time-badge">{p.currentTime}</span>}
      <button className="icon-action" aria-label="調査を終えてホームへ" onClick={() => quit()}><X size={22} /></button>
    </div></div>
    {!p.activeArea ? <section className="area-planner">
      <div className="area-planner-intro"><Compass size={24} /><p>手がかりを頼りに、場所と時間を選ぼう。<small>アプリの中だけで調査できます。外出は不要です。</small></p></div>
      {p.activeMission && <details className="planner-clues"><summary>依頼の手がかりを見返す</summary><h2>{p.activeMission.title}</h2>{p.activeMission.clues.map(c => <p key={c}>{c}</p>)}</details>}
      <fieldset className="time-selector"><legend>観測する時間</legend><div>{TIMES.map((time, index) => { const Icon = TIME_ICONS[index]; return <button key={time} aria-pressed={p.currentTime === time} onClick={() => p.onTimeChange(time)}><Icon size={20} />{time}</button>; })}</div></fieldset>
      <div className="area-grid">{SEARCH_AREAS.map(area => {
        const locked = area.id === 'mystery' && p.discoveredIds.length < MYSTERY_UNLOCK;
        const pool = eligibleCreatures(area.id, p.currentTime, p.discoveredIds);
        const unseen = pool.filter(c => !p.discoveredIds.includes(c.id)).length;
        return <button key={area.id} className="area-choice" disabled={locked} onClick={() => start(area)}>
          <img src={area.bgImage} alt="" /><span className="area-choice-body"><strong><area.icon size={18} />{area.label}</strong><span>{area.description}</span><small>{locked ? <><Lock size={13} />あと{MYSTERY_UNLOCK - p.discoveredIds.length}種類で解放</> : pool.length ? `未発見の気配 ${unseen}種 ／ 生体反応 ${pool.length}種` : '生体反応なし・落とし物を調べられます'}</small></span><ArrowRight size={18} />
        </button>;
      })}</div>
    </section> : <>
      {phase === 'survey' && <FieldObservationView key={trip} area={p.activeArea} time={p.currentTime} spots={spots} resolvedIds={resolvedIds} missionTitle={p.activeMission?.title} onInspect={inspect} onRestart={() => start(p.activeArea!)} />}
      {phase === 'approaching' && <div className="field-approaching"><ScanLine size={54} /><h2>気配のそばへ、静かに。</h2><p>{found?.signal.label}</p></div>}
      {phase === 'capture' && creature && <RhythmCapture creature={creature} onCapture={capture} onEscape={() => setPhase('escaped')} />}
      {(phase === 'result' || phase === 'escaped') && <div className="field-result" style={{ backgroundImage: `linear-gradient(#102d24cc,#102d24ee),url('${p.activeArea.fpsImage}')` }}>
        <section className="result-notebook">
          <p className="field-eyebrow">{phase === 'escaped' ? 'TAKE YOUR TIME' : 'OBSERVATION COMPLETE'}</p>
          <h2>{phase === 'escaped' ? 'もう一度、落ち着いて' : behavior ? '新しい生態を観測！' : creature ? duplicate ? '再観測成功！' : '正体がわかった！' : '落とし物を回収'}</h2>
          {creature && <><img className="result-creature" src={creature.imageUrl} alt={phase === 'escaped' && !duplicate ? '撮影前の生物' : creature.name} /><h3>{phase === 'escaped' && !duplicate ? 'まだ名前はわからない' : creature.name}</h3></>}
          {item && <><span className="result-item">{item.icon}</span><h3>{item.name}</h3><p>{item.description}</p></>}
          {behavior && <div className="result-highlight"><strong>{behavior.label}</strong><p>{behavior.description}</p></div>}
          {completedTitle && <div className="result-mission"><Check size={19} /><span>依頼達成：{completedTitle}<small>ホームに叔父さんの追伸が届いています。</small></span></div>}
          <p className="result-description">{phase === 'escaped' ? '「ゆっくり撮影」なら、光が白い線の上で待ってくれます。' : creature ? duplicate ? '観測のお礼にパラレルナッツもバッグに入れました。' : '図鑑に名前と生態を記録しました。' : 'バッグに入れました。次の調査にも役立ちます。'}</p>
          {phase === 'escaped' ? <button className="action-primary" onClick={() => setPhase('capture')}><Camera size={19} />撮影をやり直す</button> : creature && <button className="action-primary" onClick={() => { quit(); p.onCreatureClick(creature); }}>図鑑で観測記録を見る<ArrowRight size={18} /></button>}
          <button className="action-secondary" onClick={resumeSurvey}>ほかの痕跡を調べる</button>
          <button className="action-text" onClick={() => quit()}>ホームへ戻る</button>
        </section>
      </div>}
    </>}
  </div>;
}
