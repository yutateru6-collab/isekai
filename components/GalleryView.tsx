import React, { useMemo, useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { CREATURES } from '../constants';
import { Creature, CreatureType } from '../types';
import CreatureCard from './CreatureCard';
interface Props { favorites: string[]; discoveredIds: string[]; setShowBook: (open: boolean) => void; onCreatureClick: (c: Creature) => void }
const CATEGORIES = ['すべての場所', ...Object.values(CreatureType)];
const STATUS = ['すべて', '発見済み', '未発見', 'お気に入り'];
export default function GalleryView({ favorites, discoveredIds, setShowBook, onCreatureClick }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status, setStatus] = useState(STATUS[0]);
  const filtered = useMemo(() => CREATURES.filter(c => {
    const discovered = discoveredIds.includes(c.id);
    const searchable = discovered ? `${c.name} ${c.latinName} ${c.id} ${c.type}` : `${c.id} ${c.type}`;
    return searchable.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && (category === CATEGORIES[0] || c.type === category) && (status === 'すべて' || status === '発見済み' && discovered || status === '未発見' && !discovered || status === 'お気に入り' && favorites.includes(c.id));
  }), [query, category, status, discoveredIds, favorites]);
  return <section className="catalog" aria-label="生物図鑑">
    <div className="catalog-heading"><div><p className="field-eyebrow">YOUR FIELD GUIDE</p><h2>出会いを集める図鑑</h2><p>発見 {discoveredIds.length}種。次の正体は、まだわからない。</p></div><button className="icon-action book-view-toggle" aria-label="本の図鑑で読む" onClick={() => setShowBook(true)}><BookOpen size={22} /></button></div>
    <div className="catalog-search"><Search size={19} /><input aria-label="名前・番号・生息地で検索" placeholder="名前・No.・生息地で検索" value={query} onChange={e => setQuery(e.target.value)} />{query && <button className="icon-action" aria-label="検索をクリア" onClick={() => setQuery('')}><X size={18} /></button>}</div>
    <div className="catalog-status" role="group" aria-label="発見状態で絞り込み">{STATUS.map(s => <button aria-pressed={s === status} onClick={() => setStatus(s)} key={s}>{s === 'お気に入り' ? '♥ ' : ''}{s}</button>)}</div>
    <div className="catalog-categories" role="group" aria-label="生息地で絞り込み">{CATEGORIES.map(c => <button aria-pressed={category === c} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div>
    <p className="catalog-count" role="status">{filtered.length}件の観測ノート</p>
    {filtered.length ? <div className="catalog-grid">{filtered.map(c => <CreatureCard key={c.id} creature={c} isLocked={!discoveredIds.includes(c.id)} isFavorite={favorites.includes(c.id)} onClick={onCreatureClick} />)}</div> : <div className="catalog-empty"><BookOpen size={32} /><h3>まだ、ここには記録がありません。</h3><p>{status === 'お気に入り' ? '発見済み生物の詳細から、ハートを押してみよう。' : '未発見の生物は、番号や生息地で探せます。'}</p><button className="action-secondary" onClick={() => { setQuery(''); setCategory(CATEGORIES[0]); setStatus(STATUS[0]); }}>絞り込みをすべて解除</button></div>}
  </section>;
}
