import React from 'react';
import { Check, Heart } from 'lucide-react';
import { Creature } from '../types';
import { anonymousName } from '../services/field';
import CatalogImage from './CatalogImage';
interface Props { creature: Creature; onClick: (c: Creature) => void; isNew?: boolean; isLocked?: boolean; isFavorite?: boolean }
export default function CreatureCard({ creature, onClick, isNew = false, isLocked = false, isFavorite = false }: Props) {
  const label = isLocked ? anonymousName(creature.id) : creature.name;
  return <button className={`creature-tile ${isLocked ? 'creature-tile-unknown' : ''}`} aria-label={`${label}の${isLocked ? 'スケッチ' : '観測記録'}を見る`} onClick={() => onClick(creature)}>
    <span className="creature-tile-meta"><span>No.{creature.id}</span>{isFavorite && !isLocked ? <Heart size={15} fill="currentColor" aria-label="お気に入り" /> : isNew ? <span>NEW</span> : null}</span>
    <CatalogImage src={isLocked ? creature.sketchUrl || creature.imageUrl : creature.imageUrl} alt={isLocked ? `${anonymousName(creature.id)}の目撃スケッチ` : creature.name} />
    <span className="creature-tile-name">{isLocked ? '未確認生物' : creature.name}</span>
    <span className="creature-tile-habitat">{creature.type}</span>
    <span className="creature-tile-state">{isLocked ? 'スケッチを手がかりに探す' : <><Check size={13} />観測済み</>}</span>
  </button>;
}
