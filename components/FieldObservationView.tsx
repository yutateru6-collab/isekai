import React, { useState } from 'react';
import { ArrowRight, AudioLines, Check, Fingerprint, ScanLine, Sparkles } from 'lucide-react';
import { SearchArea, TimeOfDay } from '../types';
import { FieldSpot } from '../services/field';

interface Props {
  area: SearchArea;
  time: TimeOfDay;
  spots: FieldSpot[];
  resolvedIds: string[];
  missionTitle?: string;
  onInspect: (spot: FieldSpot) => void;
  onRestart: () => void;
}
const SIGNAL_ICONS = { sound: AudioLines, trace: Fingerprint, light: Sparkles };

export default function FieldObservationView({ area, time, spots, resolvedIds, missionTitle, onInspect, onRestart }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = spots.find(s => s.id === selectedId && !resolvedIds.includes(s.id));
  const remaining = spots.filter(s => !resolvedIds.includes(s.id));
  const isNight = time === TimeOfDay.Night;
  return <div className="field-layout">
    <div className={`field-scene ${isNight ? 'field-scene-night' : ''}`} aria-label={`${area.label}の観察風景`}>
      <img src={area.fpsImage} alt="" className={`field-landscape ${selected ? 'field-landscape-focus' : ''}`} />
      <div className="field-shade" />
      <div className="field-scene-caption"><span className="field-eyebrow">PARALLEL CAM / FIELD VIEW</span><p>いつもの景色に、小さな違和感。</p></div>
      <div className="viewfinder-corner corner-tl" /><div className="viewfinder-corner corner-br" />
      {spots.map((spot, index) => {
        const done = resolvedIds.includes(spot.id);
        return <button key={spot.id} className={`field-marker ${selectedId === spot.id ? 'is-selected' : ''} ${done ? 'is-resolved' : ''}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} aria-label={`痕跡${index + 1}：${spot.signal.label}${done ? '（調査済み）' : ''}`} aria-pressed={selectedId === spot.id} disabled={done} onClick={() => setSelectedId(spot.id)}>
          <span>{done ? <Check size={21} /> : String(index + 1).padStart(2, '0')}</span>
        </button>;
      })}
      <div className="field-scene-footer"><ScanLine size={17} /><span>見つかった痕跡 {spots.length} ／ 未調査 {remaining.length}</span></div>
    </div>
    <section className="field-notebook" aria-label="痕跡の調査ノート">
      <div className="field-notebook-heading"><div><p className="field-eyebrow">OBSERVATION NOTES</p><h2>どの痕跡を調べる？</h2></div><span className="field-count">{resolvedIds.length} / {spots.length}</span></div>
      {missionTitle && <p className="field-mission-caption">調査中の依頼：{missionTitle}</p>}
      <p className="field-intro">気配を選んで、特徴を読む。手がかりと似ているものを探そう。</p>
      <div className="field-trace-list">{spots.map((spot, index) => {
        const Icon = SIGNAL_ICONS[spot.signal.kind];
        const done = resolvedIds.includes(spot.id);
        return <button key={spot.id} className={`field-trace ${selectedId === spot.id ? 'is-selected' : ''}`} disabled={done} aria-pressed={selectedId === spot.id} onClick={() => setSelectedId(spot.id)}>
          <span className="field-trace-number">{String(index + 1).padStart(2, '0')}</span><Icon size={19} /><span className="field-trace-label">{spot.signal.label}</span>{done ? <Check size={18} aria-label="調査済み" /> : <ArrowRight size={17} />}
        </button>;
      })}</div>
      <div className="field-detail" aria-live="polite" aria-atomic="true">
        {selected ? <><p className="field-detail-label">カム越しに見えたこと</p><p>{selected.signal.detail}</p></> : <p className="field-detail-empty">{remaining.length ? '景色の番号、または上の痕跡を選んでください。' : 'この場所の痕跡は、すべて調べました。別の場所や時間にも目を向けてみよう。'}</p>}
      </div>
      {remaining.length ? <button className="action-primary field-inspect" disabled={!selected} onClick={() => selected && onInspect(selected)}><ScanLine size={20} />{selected?.reward.type === 'item' ? '落とし物を調べて回収' : 'そっと近づいて観察'}<ArrowRight size={19} /></button> : <button className="action-primary field-inspect" onClick={onRestart}>新しい痕跡を探す<ArrowRight size={19} /></button>}
      <p className="field-footnote">時間制限なし。違う痕跡もあとから調べられます。</p>
    </section>
  </div>;
}
