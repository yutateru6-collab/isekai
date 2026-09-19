
import React, { useState, useEffect } from 'react';
import { Creature } from '../types';
import { Star, Lock, AlertTriangle } from 'lucide-react';

interface CreatureCardProps {
  creature: Creature;
  onClick: (creature: Creature) => void;
  isNew?: boolean;
  isLocked?: boolean;
}

const CreatureCard: React.FC<CreatureCardProps> = ({ creature, onClick, isNew, isLocked = false }) => {
  const [imgSrc, setImgSrc] = useState(creature.sketchUrl || creature.imageUrl);

  useEffect(() => {
    if (isLocked) {
      setImgSrc(creature.sketchUrl || creature.imageUrl);
    } else {
      setImgSrc(creature.imageUrl);
    }
  }, [creature, isLocked]);

  // --- ロック中（未発見）モード ---
  if (isLocked) {
    // スケッチがある場合（ターゲット情報あり）
    if (creature.sketchUrl) {



      return (
        <div
          role="button" tabIndex={0} aria-label={`${creature.name}のスケッチを見る`}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(creature); } }}
          onClick={() => onClick(creature)}
          className="group relative h-full cursor-pointer"
        >
          <div className="relative bg-[#F5F5DC] p-2 rounded-3xl shadow-md h-full flex flex-col items-center border-[6px] border-[#E0E0E0] hover:border-pop-yellow transition-colors rotate-1 hover:rotate-2 hover:scale-[1.02] transform duration-300">
            {/* ピン留め */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 shadow-sm border border-red-500 z-20"></div>

            <div className="w-full aspect-square mb-2 overflow-hidden rounded-xl border-2 border-[#D7CCC8] bg-[#FFFDE7] relative flex items-center justify-center">
              <img
                src={creature.sketchUrl}
                loading="lazy"
                alt={creature.name}
                className="w-full h-full object-contain p-1"
              />
              <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-4">
                <span className="text-red-600 font-black border-4 border-red-600 px-2 py-1 rotate-[-5deg] opacity-60 text-xl tracking-widest uppercase bg-white/50 backdrop-blur-[1px]">Target</span>
              </div>
            </div>

            <div className="text-center w-full mt-auto">
              <p className="font-handwriting font-bold text-[#5D4037] text-sm mb-1 line-clamp-1">
                {creature.name} (???)
              </p>
              <div className="flex justify-center gap-1 opacity-50">
                <AlertTriangle className="w-4 h-4 text-[#8D6E63]" />
                <span className="text-[10px] font-bold text-[#8D6E63]">捜索中</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 情報なし（完全ロック）
    return (
      <div className="relative bg-gray-100 rounded-3xl border-4 border-dashed border-gray-300 p-4 h-full min-h-[200px] flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3 text-gray-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="text-center w-full">
          <p className="font-black text-gray-400 text-lg mb-1 tracking-widest">
            NO DATA
          </p>
          <div className="inline-block bg-white px-3 py-1 rounded-md border border-gray-200">
            <p className="text-xs font-bold text-gray-400">
              {creature.type}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- 発見済み（カード）モード ---
  const isSage = creature.role?.startsWith('sage_');

  return (
    <div
      role="button" tabIndex={0} aria-label={`${creature.name}の観測記録を見る`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(creature); } }}
      onClick={() => onClick(creature)}
      className="group relative h-full cursor-pointer perspective-1000"
    >
      <div
        className={`
          relative p-2 rounded-3xl transition-all duration-500 h-full flex flex-col items-center border-b-4 
          ${isSage
            ? 'bg-slate-900 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.9)] hover:-translate-y-3'
            : 'bg-white border-gray-200 shadow-card hover:shadow-xl hover:-translate-y-2 hover:border-pop-blue'
          }
        `}
      >
        {/* 賢者エフェクト（背景） */}
        {isSage && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)] animate-pulse"></div>
          </div>
        )}

        {/* 写真エリア */}
        <div
          className={`
            relative w-full aspect-square mb-3 overflow-hidden rounded-2xl border-2 transition-colors flex items-center justify-center
            ${isSage
              ? 'bg-black border-purple-400/50 group-hover:border-purple-300'
              : 'bg-gray-50 border-gray-100 group-hover:border-pop-blue'
            }
          `}
        >
          <img
            src={imgSrc}
            alt={creature.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 relative z-10"
            loading="lazy"
          />

          {/* キラキラオーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"></div>

          {/* NEWバッジ */}
          {isNew && (
            <div className="absolute top-2 left-2 bg-pop-pink text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md border-2 border-white animate-bounce-slight z-30">
              NEW!
            </div>
          )}

          {/* 賢者バッジ */}
          {isSage && (
            <div className="absolute top-2 right-2 text-purple-200 z-30 animate-spin-slow">
              <Star className="w-5 h-5 fill-purple-400 stroke-purple-200" />
            </div>
          )}
        </div>

        {/* テキストエリア */}
        <div className="w-full px-1 text-center mt-auto relative z-10">
          <h3
            className={`
              font-black text-base mb-2 truncate transition-colors
              ${isSage ? 'text-purple-200 group-hover:text-purple-100' : 'text-kids-text group-hover:text-pop-blue'}
            `}
          >
            {creature.name}
          </h3>

          <div className={`flex justify-center items-center gap-1 rounded-full py-1 ${isSage ? 'bg-purple-900/50' : 'bg-pastel-yellow/50'}`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < creature.dangerLevel
                    ? (isSage ? 'fill-purple-400 text-purple-400' : 'fill-pop-yellow text-pop-yellow')
                    : (isSage ? 'fill-gray-700 text-gray-700' : 'fill-gray-200 text-gray-200')
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatureCard;
