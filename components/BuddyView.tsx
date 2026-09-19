import React from 'react';
import { Creature } from '../types';
import { Heart, Box, Sparkles } from 'lucide-react';

interface BuddyViewProps {
  buddy: Creature | null;
  memoryLabels: string[];
  dailyPetCount: number;
  onBuddyInteraction: (e: React.MouseEvent) => void;
  onOpenInventory: (e: React.MouseEvent) => void;
}

const BuddyView: React.FC<BuddyViewProps> = ({
  buddy,
  memoryLabels,
  dailyPetCount,
  onBuddyInteraction,
  onOpenInventory
}) => {
  if (!buddy) return null;
  const recentMemories = memoryLabels.slice(-3).reverse();

  return (
    <div className="mb-6 relative group animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="absolute inset-0 bg-gradient-to-r from-pop-pink/20 to-pop-blue/20 rounded-3xl blur-xl animate-pulse"></div>
      <div className="relative bg-white/85 backdrop-blur border-2 border-white rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-transform" onClick={onBuddyInteraction}>
          <div className="relative shrink-0">
            <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white ${buddy.evolutionLevel > 1 ? 'ring-4 ring-pop-yellow' : ''}`}>
              <img src={buddy.imageUrl} className="w-full h-full object-cover" alt={buddy.name} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-pop-yellow text-white p-1 rounded-full border-2 border-white shadow-sm">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center gap-2 mb-1">
              <h3 className="font-black text-kids-text flex items-center gap-2 truncate">
                {buddy.name}
                {buddy.evolutionLevel > 1 && <span className="text-[10px] bg-pop-yellow text-white px-1.5 rounded-full border border-white shadow-sm">EVO</span>}
              </h3>
              <span className="text-xs font-bold text-pop-pink bg-pop-pink/10 px-2 py-0.5 rounded-full shrink-0">相棒</span>
            </div>
            <p className="text-xs font-bold text-gray-500 mb-2">{buddy.perk} ・ 絆 {buddy.syncRate}%</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 relative overflow-hidden ${buddy.syncRate >= 100 ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 animate-shimmer' : 'bg-gradient-to-r from-pop-pink to-pop-purple'}`}
                style={{ width: `${Math.min(100, buddy.syncRate || 0)}%` }}
              >
                {buddy.syncRate >= 100 && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
              </div>
            </div>
            <div className="flex justify-between gap-2 mt-1 text-[10px] font-black">
              <span className="text-stone-500">今日のふれあい {Math.min(3, dailyPetCount)} / 3</span>
              {buddy.syncRate >= 100 && <span className="text-pop-yellow animate-bounce">最高の相棒！</span>}
            </div>
          </div>

          <button
            onClick={onOpenInventory}
            className="ml-1 p-3 bg-white border-2 border-dashed border-pop-blue rounded-xl text-pop-blue hover:bg-pop-blue hover:text-white transition-all shadow-sm shrink-0"
            title="アイテムを使う"
            aria-label="相棒にアイテムを使う"
          >
            <Box className="w-5 h-5" />
          </button>
        </div>

        {recentMemories.length > 0 && <div className="mt-4 border-t border-amber-100 pt-3">
          <p className="text-[11px] font-black text-stone-500 flex items-center gap-1 mb-2"><Sparkles size={14} />最近の思い出</p>
          <div className="flex flex-wrap gap-2">{recentMemories.map((label, i) => <span key={`${label}-${i}`} className="text-[11px] font-bold rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[#5d4037]">{label}</span>)}</div>
        </div>}
        <p className="text-[10px] text-stone-500 mt-3 text-center">相棒をタップすると反応します。絆が深まるふれあいは1日3回まで。</p>
      </div>
    </div>
  );
};

export default BuddyView;
