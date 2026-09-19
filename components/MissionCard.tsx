import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Compass, Lightbulb, Mail } from 'lucide-react';
import { InvestigationMission } from '../data/missions';

interface Props {
  mission: InvestigationMission | null;
  completedCount: number;
  total: number;
  postscript: InvestigationMission | null;
  onAcknowledgePostscript: (id: string) => void;
  onDepart: () => void;
  inventoryIds: string[];
}
export default function MissionCard({ mission, completedCount, total, postscript, onAcknowledgePostscript, onDepart, inventoryIds }: Props) {
  const [showHint, setShowHint] = useState(false);
  useEffect(() => setShowHint(false), [mission?.id]);
  return <section className={`mission-note ${postscript ? 'mission-note-letter' : ''}`} aria-label="叔父さんの調査依頼">
    <div className="mission-note-heading"><span><Mail size={18} />{postscript ? '叔父さんからの追伸' : '叔父さんの調査依頼'}</span><span className="mission-fraction">{String(completedCount).padStart(2, '0')} / {String(total).padStart(2, '0')}</span></div>
    {postscript ? <><h2>調査、ありがとう。</h2><p className="mission-subtitle">{postscript.title} ／ 調査完了</p><p className="mission-letter">{postscript.postscript}</p><button className="action-primary" onClick={() => onAcknowledgePostscript(postscript.id)}>追伸を読んで、次の依頼へ<ArrowRight size={18} /></button></> : mission ? <>
      <h2>{mission.title}</h2>
      <ol className="mission-clues">{mission.clues.map((clue, i) => <li key={clue}><span>{String(i + 1).padStart(2, '0')}</span><p>{clue}</p></li>)}</ol>
      <button className="mission-hint-toggle" aria-expanded={showHint} aria-controls="mission-extra-hint" onClick={() => setShowHint(!showHint)}><Lightbulb size={17} />{showHint ? '追加ヒントを閉じる' : '追加ヒントを見る'}</button>
      {showHint && <div id="mission-extra-hint" className="mission-extra-hint"><p>{mission.extraHint}</p>{mission.requiredItemId && <p>{inventoryIds.includes(mission.requiredItemId) ? '必要な持ち物はバッグに入っています。消費せずに調査できます。' : '必要な道具がないときは、どのエリアでも「金属の落とし物」の痕跡を調べて回収しよう。持ち物がそろったら、新しい調査で対象を探せます。'}</p>}</div>}
      <button className="action-primary mission-depart" onClick={onDepart}><Compass size={21} /><span>調査に出発<small>場所と時間を、自分で選ぶ</small></span><ArrowRight size={21} /></button>
    </> : <><h2><Check size={24} />すべての依頼を観測完了</h2><p className="mission-letter">{total}件の手がかりを解き明かしました。まだ見ぬ生物や新しい生態を、相棒と探しにいこう。</p><button className="action-primary mission-depart" onClick={onDepart}><Compass size={21} />自由に調査に出発<ArrowRight size={21} /></button></>}
  </section>;
}
