import React, { useState, useMemo } from 'react';
import { Creature, CreatureType } from '../types';
import { CREATURES } from '../constants';
import { Search } from 'lucide-react';
import CreatureCard from './CreatureCard';

interface GalleryViewProps {
    favorites: string[]; // ids
    discoveredIds: string[]; // ids
    setShowBook: (show: boolean) => void;
    onCreatureClick: (creature: Creature) => void;
}

const CATEGORIES = ['すべて', ...Object.values(CreatureType)];

const GalleryView: React.FC<GalleryViewProps> = ({
    favorites,
    discoveredIds,
    setShowBook,
    onCreatureClick
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('すべて');

    const filteredCreatures = useMemo(() => {
        return CREATURES.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.latinName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'すべて' || c.type === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Search Bar & Book Toggle */}
            <div className="flex gap-3 mb-6 items-center">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-6 w-6 text-pop-blue" />
                    </div>
                    <input
                        type="text"
                        aria-label="生物名で検索"
                        placeholder="生物名で検索..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-4 border-pastel-blue rounded-full text-kids-text placeholder-gray-400 focus:outline-none focus:border-pop-blue transition-all shadow-sm font-bold text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Book View Toggle Button */}
                <button
                    onClick={() => setShowBook(true)}
                    className="w-16 h-16 bg-[#8D6E63] rounded-2xl border-4 border-[#5D4037] shadow-pop hover:scale-105 active:scale-95 transition-all flex items-center justify-center group overflow-hidden relative shrink-0"
                    title="図鑑モードを開く"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                    <img src="/image/book_icon.png" alt="Book" className="w-12 h-12 object-contain drop-shadow-md group-hover:rotate-6 transition-transform" />
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 px-1 scrollbar-hide justify-start md:justify-center">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-black transition-all duration-200 border-2 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[2px]
              ${activeCategory === cat
                                ? 'bg-pop-blue text-white border-pop-blue'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }
            `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {filteredCreatures.length === 0 && <p className="bg-white rounded-xl p-6 text-center font-bold">一致する生物がいません。名前やエリアを変えてみよう。</p>}
            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 md:gap-x-4 gap-y-4 md:gap-y-6 pb-4 px-1 md:px-2">
                {filteredCreatures.map((creature, index) => (
                    <CreatureCard
                        key={creature.id}
                        creature={creature}
                        onClick={onCreatureClick}
                        isLocked={!discoveredIds.includes(creature.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GalleryView;
