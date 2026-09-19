import React from 'react';
import { Box, Heart, Sparkles } from 'lucide-react';
import { Creature } from '../types';
interface Props {
  buddy: Creature | null;
  memoryLabels: string[];
  dailyPetCount: number;
  onBuddyInteraction: (e: React.MouseEvent) => void;
  onOpenInventory: (e: React.MouseEvent) => void;
  onOpenGallery: () => void;
}
export default function BuddyView({ buddy, memoryLabels, dailyPetCount, onBuddyInteraction, onOpenInventory, onOpenGallery }: Props) {
  if (!buddy) return <section className="buddy-note buddy-note-empty"><span className="field-eyebrow">YOUR COMPANION</span><h2>最初の出会いを、相棒に。</h2><p>撮影に成功した生物は、図鑑から相棒にできます。</p><div><button className="action-secondary" onClick={onOpenGallery}>図鑑で相棒を選ぶ</button><button className="icon-action" onClick={onOpenInventory} aria-label="バッグを開く"><Box size={21} /></button></div></section>;
  const bond = Math.min(100, buddy.syncRate || 0);
  const latest = memoryLabels.at(-1);
  return <section className="buddy-note" aria-label="相棒との時間">
    <div className="buddy-note-heading"><span className="field-eyebrow">YOUR COMPANION</span><span><Heart size={13} />相棒</span></div>
    <div className="buddy-main"><button className="buddy-pet" onClick={onBuddyInteraction} aria-label={`${buddy.name}とふれあう`}><img src={buddy.imageUrl} alt="" /><span><strong>{buddy.name}</strong><small>{buddy.perk}</small><span className="buddy-bond-label">絆 {bond}% <span>{bond >= 100 ? '最高の相棒' : '今日のふれあい ' + Math.min(3, dailyPetCount) + '/3'}</span></span><span role="progressbar" aria-label="相棒との絆" aria-valuenow={bond} aria-valuemin={0} aria-valuemax={100} className="buddy-bond"><span style={{ width: `${bond}%` }} /></span></span></button><button className="icon-action buddy-bag" onClick={onOpenInventory} aria-label="相棒にアイテムを使う"><Box size={21} /></button></div>
    <div className="buddy-latest"><Sparkles size={16} /><span>{latest ?? 'ふれあって、最初の思い出を残そう。'}</span></div>
    {memoryLabels.length > 1 && <details className="buddy-memories"><summary>思い出をすべて見る <span>{memoryLabels.length}件</span></summary><ul>{[...memoryLabels].reverse().map(label => <li key={label}>{label}</li>)}</ul></details>}
    <p className="buddy-help">絆が深まるふれあいは、相棒を替えても1日合計3回。反応は何度でも楽しめます。</p>
  </section>;
}
