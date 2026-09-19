import React from 'react';
import { Creature } from '../types';
import { Heart, Box } from 'lucide-react';

interface BuddyViewProps {
    buddy: Creature | null;
    onBuddyInteraction: (e: React.MouseEvent) => void;
    onOpenInventory: (e: React.MouseEvent) => void;
}

const BuddyView: React.FC<BuddyViewProps> = ({
    buddy,
    onBuddyInteraction,
    onOpenInventory
}) => {
    if (!buddy) return null;

    return (
        <div
            className="mb-6 relative group cursor-pointer animate-in fade-in slide-in-from-top-4 duration-500"
            onClick={onBuddyInteraction}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-pop-pink/20 to-pop-blue/20 rounded-3xl blur-xl animate-pulse"></div>
            <div className="relative bg-white/80 backdrop-blur border-2 border-white rounded-3xl p-4 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition-transform">
                <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white ${buddy.evolutionLevel > 1 ? 'ring-4 ring-pop-yellow' : ''}`}>
                        <img src={buddy.imageUrl} className="w-full h-full object-cover" alt={buddy.name} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-pop-yellow text-white p-1 rounded-full border-2 border-white shadow-sm">
                        <Heart className="w-4 h-4 fill-current" />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-black text-kids-text flex items-center gap-2">
                            {buddy.name}
                            {buddy.evolutionLevel > 1 && (
                                <span className="text-[10px] bg-pop-yellow text-white px-1.5 rounded-full border border-white shadow-sm">EVO</span>
                            )}
                        </h3>
                        <span className="text-xs font-bold text-pop-pink bg-pop-pink/10 px-2 py-0.5 rounded-full">相棒</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mb-2">{buddy.perk} ・ 絆 {buddy.syncRate}%</p>
                    {/* Sync Bar */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full transition-all duration-500 relative overflow-hidden ${buddy.syncRate >= 100 ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 animate-shimmer' : 'bg-gradient-to-r from-pop-pink to-pop-purple'}`}
                            style={{ width: `${Math.min(100, buddy.syncRate || 0)}%` }}
                        >
                            {buddy.syncRate >= 100 && (
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            )}
                        </div>
                    </div>
                    {buddy.syncRate >= 100 && true && (
                        <p className="text-[10px] text-pop-yellow font-black mt-1 animate-bounce text-right">最高の相棒！</p>
                    )}
                </div>

                {/* Bag Button (Inside Buddy Card) */}
                <button
                    onClick={onOpenInventory}
                    className="ml-2 p-3 bg-white border-2 border-dashed border-pop-blue rounded-xl text-pop-blue hover:bg-pop-blue hover:text-white transition-all shadow-sm"
                    title="アイテムを使う"
                >
                    <Box className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default BuddyView;
