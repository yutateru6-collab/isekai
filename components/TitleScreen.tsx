import React, { useState, useEffect } from 'react';
import { Sparkles, Play } from 'lucide-react';
import { CREATURES } from '../constants';

interface TitleScreenProps {
    onStart: () => void;
    hasSave?: boolean;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, hasSave }) => {
    const [featuredCreature, setFeaturedCreature] = useState(CREATURES[0]);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Pick a random creature to feature each time (or cycle)
        const random = CREATURES[Math.floor(Math.random() * CREATURES.length)];
        setFeaturedCreature(random);
    }, []);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-maru bg-black">
            {/* 1. Background Layer */}
            {/* 1. Background Layer (Key Visual) */}
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/image/title_key_visual.png')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                {/* Animated Particles/Dust */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)" }}></div>
            </div>



            {/* 3. UI Layer */}
            <div className="absolute inset-0 flex flex-col items-center justify-between py-12 md:py-20 z-10">

                {/* Title Logo Area */}
                <div className="flex flex-col items-center text-center mt-4 md:mt-10 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-1 rounded-full border-2 border-pop-blue shadow-sm mb-4">
                        <span className="text-pop-blue font-black tracking-widest text-sm md:text-base">
                            PARALLEL WORLD OBSERVER
                        </span>
                    </div>

                    <h1 className="relative flex flex-col items-center">
                        <span className="block text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pop-green to-emerald-600 stroke-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] tracking-widest leading-none ml-4"
                            style={{ WebkitTextStroke: "3px white" }}>
                            生き物図鑑！
                        </span>
                        <span className="block text-3xl md:text-5xl font-black text-pop-pink transform -rotate-1 -mt-1 drop-shadow-md tracking-widest"
                            style={{ WebkitTextStroke: "2px white" }}>
                            異世界編
                        </span>

                        <Sparkles className="absolute -top-6 -right-6 w-12 h-12 text-yellow-400 animate-pulse" />
                        <Sparkles className="absolute bottom-0 -left-8 w-8 h-8 text-pop-blue animate-spin-slow" />
                    </h1>
                </div>

                {/* Start Button Area */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <button
                        onClick={onStart}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`
              relative group bg-gradient-to-b from-pop-yellow to-orange-500 text-white 
              px-16 py-6 rounded-full font-black text-3xl shadow-[0_8px_0_#d97706] 
              active:shadow-none active:translate-y-2 transition-all duration-200
              border-4 border-white overflow-hidden
              ${isHovered ? 'scale-105' : 'scale-100'}
            `}
                    >
                        {/* Shiny effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>

                        <div className="flex items-center gap-3 relative z-10 drop-shadow-md">
                            <Play className="w-8 h-8 fill-current" />
                            <span>{hasSave ? 'つづきから' : 'スタート'}</span>
                        </div>
                    </button>
                    <div className="text-center mt-4 font-bold text-white/90 text-sm animate-pulse">
                        TAP TO START
                    </div>
                </div>

                {/* Copyright */}
                <div className="absolute bottom-4 text-[10px] text-white/60 font-bold">
                    © 2026 Parallel World Lab. / Designed for Kids
                </div>
            </div>
        </div>
    );
};

export default TitleScreen;
