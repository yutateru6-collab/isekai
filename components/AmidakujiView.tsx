import React, { useState, useEffect, useRef } from 'react';
import { Creature, Item, TimeOfDay } from '../types';
import { HelpCircle, Gift, Footprints, Trees, Castle, Flag, Cloud, Sun, Mountain, Play } from 'lucide-react';
import { ITEMS } from '../constants';
import { eligibleCreatures, pickCreature } from '../services/game';

interface AmidaPoint {
    x: number;
    y: number;
}

interface Bridge {
    col: number; // Connects col and col+1
    rowY: number; // Vertical position (0-100)
}

export interface Reward {
    type: 'creature' | 'item' | 'empty';
    data?: Creature | Item;
    label: string;
}

interface AmidakujiViewProps {
    areaId: string;
    time: TimeOfDay;
    discoveredIds: string[];
    rareBonus: boolean;
    onComplete: (reward: Reward) => void;
    onClose: () => void;
}

const LINES = 4;

const AmidakujiView: React.FC<AmidakujiViewProps> = ({ areaId, time, discoveredIds, rareBonus, onComplete, onClose }) => {
    const [bridges, setBridges] = useState<Bridge[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [selectedLine, setSelectedLine] = useState<number>(1); // Default to lane 1 (0-indexed)
    const [charPos, setCharPos] = useState<AmidaPoint | null>(null);
    const [isWalking, setIsWalking] = useState(false);

    const frame = useRef(0);
    const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const walking = useRef(false);
    useEffect(() => () => { cancelAnimationFrame(frame.current); if (completionTimer.current) clearTimeout(completionTimer.current); }, []);

    // Setup Game Board
    useEffect(() => {
        // 1. Generate Bridges
        const newBridges: Bridge[] = [];
        const numBridges = 7 + Math.floor(Math.random() * 4); // 7-10 bridges

        for (let i = 0; i < numBridges; i++) {
            const col = Math.floor(Math.random() * (LINES - 1));
            const rowY = 15 + Math.random() * 70; // Connect between 15% and 85% height

            // Avoid heavy clustering
            if (!newBridges.some(b => Math.abs(b.rowY - rowY) < 5 && b.col === col)) {
                newBridges.push({ col, rowY });
            }
        }
        setBridges(newBridges);

        // 2. Generate Rewards
        const pool = eligibleCreatures(areaId, time, discoveredIds);
        const first = pickCreature(pool, discoveredIds, rareBonus);
        const second = pickCreature(pool.filter(c => c.id !== first?.id), discoveredIds, rareBonus) ?? first;
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const newRewards: Reward[] = [
            first ? { type: 'creature', data: first, label: '生体反応' } : { type: 'item', data: item, label: 'アイテム' },
            second ? { type: 'creature', data: second, label: '生体反応' } : { type: 'item', data: item, label: 'アイテム' },
            { type: 'item', data: item, label: 'アイテム' },
            first ? { type: 'creature', data: pickCreature(pool, discoveredIds, rareBonus), label: '生体反応' } : { type: 'item', data: item, label: 'アイテム' }
        ];

        // Shuffle
        for (let i = newRewards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newRewards[i], newRewards[j]] = [newRewards[j], newRewards[i]];
        }
        setRewards(newRewards.slice(0, LINES));

    }, [areaId, time]);

    const calculatePath = (startCol: number) => {
        const path: AmidaPoint[] = [];
        let col = startCol;
        let y = 0;

        path.push({ x: getColX(col), y: 0 }); // Top

        // Sort bridges by Y
        const sortedBridges = [...bridges].sort((a, b) => a.rowY - b.rowY);

        // Traverse down
        while (y < 100) {
            // Find next bridge affecting current column
            const nextBridge = sortedBridges.find(b =>
                b.rowY > y && (b.col === col || b.col === col - 1)
            );

            if (nextBridge) {
                // Walk to bridge Y
                path.push({ x: getColX(col), y: nextBridge.rowY });
                y = nextBridge.rowY;

                // Cross bridge
                if (nextBridge.col === col) {
                    col++; // Move Right
                } else {
                    col--; // Move Left
                }
                path.push({ x: getColX(col), y: nextBridge.rowY });
            } else {
                // No more bridges, go to bottom
                path.push({ x: getColX(col), y: 100 });
                y = 100;
            }
        }

        return { path, finalCol: col };
    };

    const handleLaneClick = (index: number) => {
        if (isWalking) return;
        setSelectedLine(index);
    };

    const handleStart = () => {
        if (walking.current || !rewards.length) return;
        walking.current = true;
        setIsWalking(true);
        setCharPos({ x: getColX(selectedLine), y: 0 });

        const { path, finalCol } = calculatePath(selectedLine);

        // Animated Walk
        let ptIndex = 0;
        let progress = 0;

        let previousTime = 0;
        const animate = (now: number) => {
            if (ptIndex >= path.length - 1) {
                completionTimer.current = setTimeout(() => {
                    onComplete(rewards[finalCol]);
                }, 800);
                return;
            }

            const startPt = path[ptIndex];
            const endPt = path[ptIndex + 1];

            const dx = endPt.x - startPt.x;
            const dy = endPt.y - startPt.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const step = Math.min(previousTime ? now - previousTime : 16, 50) * 0.06;
            previousTime = now;
            progress += step;

            if (progress >= dist) {
                progress = 0;
                ptIndex++;
                setCharPos(endPt);
                frame.current = requestAnimationFrame(animate);
            } else {
                const ratio = progress / dist;
                setCharPos({
                    x: startPt.x + dx * ratio,
                    y: startPt.y + dy * ratio
                });
                frame.current = requestAnimationFrame(animate);
            }
        };

        frame.current = requestAnimationFrame(animate);
    };


    // Area Configuration Mapping
    const getAreaConfig = (id: string) => {
        switch (id) {
            case 'garden':
                return {
                    bgImage: '/image/garden_fog_background.png',
                    fogLabel: '??? 庭の奥深く ???',
                    themeColor: 'text-orange-600',
                    borderColor: 'border-orange-500',
                    bgColor: 'bg-[#FFF8E1]'
                };
            case 'water':
                return {
                    bgImage: '/image/water_fog_background.png',
                    fogLabel: '??? 水面の下 ???',
                    themeColor: 'text-blue-600',
                    borderColor: 'border-blue-500',
                    bgColor: 'bg-[#E1F5FE]'
                };
            case 'house':
                return {
                    bgImage: '/image/house_fog_background.png',
                    fogLabel: '??? 部屋の隅 ???',
                    themeColor: 'text-purple-600',
                    borderColor: 'border-purple-500',
                    bgColor: 'bg-[#F3E5F5]'
                };
            case 'park':
            default:
                return {
                    bgImage: '/image/park_fog_background.png',
                    fogLabel: '??? 未知のエリア ???',
                    themeColor: 'text-green-600',
                    borderColor: 'border-green-500',
                    bgColor: 'bg-[#F0F8F0]'
                };
        }
    };

    const config = getAreaConfig(areaId);

    const getColX = (colIndex: number) => {
        return 20 + colIndex * (60 / (LINES - 1)); // 20% to 80% range
    };

    return (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-start min-h-[100dvh] overflow-y-auto py-3 px-2 ${config.bgColor}`}>
            {/* Background Decor - Sky & Ground */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Sky */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent h-1/2"></div>
                {/* Generic Decor that works for most overhead maps, or hide specific items if needed */}
                <Cloud className="absolute top-10 left-10 w-24 h-24 text-white opacity-80" />
                <Cloud className="absolute top-20 right-20 w-32 h-32 text-white opacity-60" />
            </div>

            {/* Header */}
            <div className={`z-10 bg-white/90 px-8 py-3 rounded-full shadow-lg border-4 ${config.borderColor} mb-3 mt-2 shrink-0`}>
                <h2 className={`text-xl font-black ${config.themeColor} tracking-widest`}>散策ルートを選ぼう！</h2>
            </div>

            {/* Game Board */}
            <div className="relative w-full max-w-lg h-[55dvh] min-h-[280px] shrink-0 bg-white/60 backdrop-blur-sm rounded-[40px] border-8 border-white shadow-2xl p-3 sm:p-6 flex flex-col justify-between overflow-hidden">

                {/* Entrances (Move Selection) */}
                <div className="relative h-20 w-full z-30">
                    {Array.from({ length: LINES }).map((_, i) => (
                        <button
                            key={i}
                            aria-label={`ルート${i + 1}`}
                            aria-pressed={selectedLine === i}
                            onClick={() => handleLaneClick(i)}
                            disabled={isWalking}
                            className={`absolute -translate-x-1/2 -top-2 w-12 sm:w-16 h-full transition-colors rounded-xl ${selectedLine === i ? 'bg-pop-blue/10' : 'hover:bg-gray-100/50'}`}
                            style={{ left: `${getColX(i)}%` }}
                        >
                            {/* Visual Indicator of Lane */}
                            <div className={`mx-auto w-2 h-2 rounded-full mb-1 ${selectedLine === i ? 'bg-pop-blue' : 'bg-gray-300'}`}></div>
                            {selectedLine === i && !isWalking && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-pop-blue animate-bounce">
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pop-blue mx-auto"></div>
                                </div>
                            )}
                        </button>
                    ))}

                    {/* Character Avatar (Moveable) */}
                    <div
                        className="absolute -translate-x-1/2 transition-all duration-300 ease-in-out z-40"
                        style={{ left: `${getColX(selectedLine)}%`, top: 0 }}
                    >
                        {/* Hide avatar here if walking starts, handled by svg layer? Or keep it here until start?
                            Let's keep it here until walking starts. 
                            If isWalking is true, we hide this static avatar and show the animated one in SVG.
                         */}
                        {!isWalking && (
                            <div className="relative group cursor-grab active:cursor-grabbing">
                                <div className="w-16 h-16 rounded-full bg-white border-4 border-pop-blue shadow-lg overflow-hidden flex items-center justify-center">
                                    <img src="/image/character_boy.png" alt="Player" className="w-full h-full object-cover scale-110 translate-y-1" />
                                </div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-pop-blue text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-sm animate-pulse">
                                    ここから！
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* The Amidakuji Lines (SVG) - z-0 */}
                <div className="relative flex-1 w-full my-4">
                    <svg className="absolute inset-0 w-full h-full" overflow="visible">
                        {/* Vertical Lines */}
                        {Array.from({ length: LINES }).map((_, i) => (
                            <line
                                key={`v-${i}`}
                                x1={`${getColX(i)}%`} y1="0%"
                                x2={`${getColX(i)}%`} y2="100%"
                                stroke="#94A3B8"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                        ))}

                        {/* Bridges (visible part) */}
                        {bridges.map((b, i) => (
                            <line
                                key={`b-${i}`}
                                x1={`${getColX(b.col)}%`} y1={`${b.rowY}%`}
                                x2={`${getColX(b.col + 1)}%`} y2={`${b.rowY}%`}
                                stroke="#94A3B8"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                        ))}
                    </svg>

                    {/* FOG OF WAR LAYER */}
                    <div
                        className="absolute top-[35%] bottom-0 left-[-20px] right-[-20px] z-20 overflow-hidden flex flex-col items-center justify-start pt-8"
                        style={{
                            background: `url('${config.bgImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#fff'
                        }}
                    >
                        <div className={`bg-white/90 ${config.themeColor} px-6 py-2 rounded-full text-sm font-black border-2 ${config.borderColor} shadow-md`}>
                            {config.fogLabel}
                        </div>
                    </div>

                    {/* Character Layer (Animated) - z-30 (Above Fog) */}
                    {isWalking && charPos && (
                        <div
                            className="absolute z-30 w-12 h-12 -ml-6 -mt-6 transition-none"
                            style={{
                                left: `${charPos.x}%`,
                                top: `${charPos.y}%`
                            }}
                        >
                            <div className="w-full h-full rounded-full bg-white border-4 border-pop-blue shadow-lg overflow-hidden flex items-center justify-center">
                                <img src="/image/character_boy.png" alt="Player" className="w-full h-full object-cover scale-110 translate-y-1" />
                            </div>
                        </div>
                    )}

                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" overflow="visible">
                        {/* Removed SVG-based foreignObject character to fix coordinate sync issues */}
                    </svg>
                </div>

                {/* Rewards Layer */}
                <div className="relative h-24 w-full z-10">
                    <div className="absolute -top-6 left-0 right-0 h-4 bg-gradient-to-b from-transparent to-black/5 z-0"></div>
                    {rewards.map((reward, i) => (
                        <div
                            key={i}
                            className="absolute -translate-x-1/2 flex flex-col items-center group cursor-help transition-transform hover:scale-110 hover:-translate-y-1"
                            style={{ left: `${getColX(i)}%`, top: 0 }}
                        >
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl border-[5px] shadow-lg flex items-center justify-center overflow-hidden mb-2 relative ${reward.type === 'creature' ? 'border-pop-pink' :
                                reward.type === 'item' ? 'border-pop-yellow' : 'border-gray-200'
                                }`}>
                                {reward.type === 'creature' && reward.data && (
                                    <>
                                        <div className="absolute inset-0 bg-pop-pink/10 animate-pulse"></div>
                                        <div className="w-full h-full flex items-center justify-center bg-pop-pink/20">
                                            <HelpCircle className="w-10 h-10 text-pop-pink animate-bounce" />
                                        </div>
                                        {(reward.data as Creature).dangerLevel >= 4 && (
                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm">RARE</div>
                                        )}
                                    </>
                                )}
                                {reward.type === 'item' && (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-yellow-200 blur-xl opacity-50 animate-pulse"></div>
                                        <Gift className="w-8 h-8 text-pop-yellow relative z-10" />
                                    </div>
                                )}
                                {reward.type === 'empty' && (
                                    <HelpCircle className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <div className="bg-white/90 text-gray-600 text-[10px] px-3 py-1 rounded-full font-black shadow-sm border border-gray-100 whitespace-nowrap">
                                {reward.label}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Footer Controls */}
            <div className="mt-3 pb-5 flex flex-col items-center gap-2 z-50 shrink-0">
                {!isWalking ? (
                    <button
                        onClick={handleStart}
                        className="bg-pop-blue text-white text-base sm:text-xl font-black px-6 sm:px-12 py-3 rounded-full shadow-pop hover:shadow-pop-hover border-4 border-white transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <Play className="w-6 h-6 fill-current" />
                        このルートで出発！
                    </button>
                ) : (
                    <div className="bg-white/80 text-gray-500 font-bold px-6 py-2 rounded-full">
                        探索中...
                    </div>
                )}

                {(
                    <button onClick={onClose} className="text-gray-400 font-bold text-sm underline hover:text-gray-600">
                        探索をやめる
                    </button>
                )}
            </div>
        </div>
    );
};

export default AmidakujiView;
