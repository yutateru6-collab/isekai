import React, { useState, useEffect } from 'react';
import { Mail, Stamp, ArrowRight } from 'lucide-react';

interface PrologueProps {
    onComplete: (userName: string) => void;
}

const Prologue: React.FC<PrologueProps> = ({ onComplete }) => {
    const [userName, setUserName] = useState('');
    const [isLetterExpanded, setIsLetterExpanded] = useState(false);
    const [showStamp, setShowStamp] = useState(false);

    // Initial animation
    const [fadeIn, setFadeIn] = useState(false);
    useEffect(() => {
        setTimeout(() => setFadeIn(true), 500);
    }, []);

    const [letterPage, setLetterPage] = useState(0);

    const letterContent = [
        // Page 1
        <div key="page1" className="space-y-3 animate-in fade-in duration-300">
            <p>
                <span className="font-bold text-lg">相棒へ</span>
            </p>
            <p>
                この手紙が届いたということは、転送実験は成功だ。<br />
                実はおじさん、今『ここじゃない世界（パラレルワールド）』に来ている。
            </p>
            <p>
                こっちはすごいぞ。空が紫だったり、見たこともない植物が生えていたり……<br />
                まさに、僕らが夢見ていた冒険の世界そのものだ！
            </p>
        </div>,
        // Page 2
        <div key="page2" className="space-y-3 animate-in fade-in duration-300">
            <p>
                でも、一つ問題が起きた。<br />
                こっちの世界の「生き物」たちが、どうやらそっちの地球へ迷い込んでしまったらしいんだ。
                放っておくと、世界のバランスが崩れてしまうかもしれない。
            </p>
            <p>
                そこで頼みがある。同封した「パラレル・カム」を使って、<br />
                紛れ込んだ<span className="font-bold text-pop-red bg-yellow-100 px-1">「異世界の生物」</span>を見つけ出し、こちらの世界へ戻す手助けをしてほしい。
            </p>
            <p>
                準備ができたら、隣のカードに名前を書いてくれ。<br />
                僕と君だけの、トップシークレット・ミッションだ！
            </p>
        </div>
    ];

    const handleRegister = () => {
        if (!userName.trim() || showStamp) return;
        setShowStamp(true);
        setTimeout(() => {
            onComplete(userName.trim());
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black flex items-center justify-center font-maru">

            {/* Background: Antique Desk */}
            <div className={`fixed inset-0 transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                <img src="/image/home_bg_desk.png" alt="Desk" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/80"></div>
            </div>

            <div className={`relative z-10 w-full max-w-6xl min-h-full py-12 flex flex-col md:flex-row items-center justify-center gap-8 transition-transform duration-1000 ${fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>

                {/* --- LEFT: The Letter (Open) --- */}
                <div
                    className={`
                relative bg-[#FDFBF7] shadow-2xl p-8 rounded-sm transform rotate-[-2deg] transition-all duration-500
                ${isLetterExpanded ? 'z-50 scale-110 rotate-0' : 'hover:-translate-y-2 cursor-zoom-in'}
                w-[90%] md:w-[60%] max-w-lg min-h-[400px] flex flex-col
            `}
                    onClick={() => !isLetterExpanded && setIsLetterExpanded(true)}
                >
                    <div className="absolute inset-0 bg-[url('/image/parchment.png')] opacity-10 pointer-events-none"></div>

                    {/* Letter Content */}
                    <div className="relative text-kids-text leading-relaxed space-y-4 flex-1">
                        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-2 mb-4">
                            <h2 className="text-xl font-black text-[#5D4037]">極秘指令書</h2>
                            <Stamp className="w-8 h-8 text-red-800 opacity-50 rotate-12" />
                        </div>

                        <div className="text-sm md:text-base font-medium min-h-[200px]">
                            {letterContent[letterPage]}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-end mt-4 border-t border-gray-100 pt-2">
                            <div className="flex gap-4 items-center">
                                {letterPage > 0 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setLetterPage(letterPage - 1); }}
                                        className="text-pop-blue font-bold text-sm hover:underline flex items-center gap-1"
                                    >
                                        ← 前のページ
                                    </button>
                                )}

                                {letterPage < letterContent.length - 1 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setLetterPage(letterPage + 1); }}
                                        className="text-pop-blue font-bold text-sm hover:underline flex items-center gap-1 animate-pulse"
                                    >
                                        次のページ →
                                    </button>
                                )}
                            </div>

                            <div className="text-right">
                                <div className="font-bold text-xs text-gray-500 mb-1">叔父さん</div>
                                <img src="/char/professor_v2.png" className="w-16 h-16 rounded-full border-2 border-gray-300 inline-block shadow-sm object-cover flex-shrink-0" />
                            </div>
                        </div>
                    </div>

                    {/* Paper Texture Overlay for realism */}
                    <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.05)] pointer-events-none rounded-sm"></div>
                </div>


                {/* --- RIGHT: ID Card (Interactive) --- */}
                <div className="relative transform rotate-[3deg] hover:rotate-[1deg] transition-transform duration-300 z-20 w-[85%] md:w-auto">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full md:w-80 border border-gray-200">
                        <div className="w-full h-32 bg-[#E1F5FE] rounded-lg mb-4 flex items-center justify-center overflow-hidden border-2 border-dashed border-[#B3E5FC] relative group">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-2 flex items-center justify-center shadow-sm">
                                    <span className="text-2xl">👤</span>
                                </div>
                                <span className="text-xs font-bold text-pop-blue">NO PHOTO</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 tracking-widest">AGENT NAME</label>
                                <input
                                    type="text"
                                    aria-label="調査員の名前"
                                    className="w-full text-center text-xl font-black border-b-2 border-gray-300 focus:border-pop-blue outline-none py-2 bg-transparent transition-colors placeholder:text-gray-200"
                                    placeholder="名前を記入"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    maxLength={10}
                                />
                            </div>

                            <div className="bg-gray-50 p-2 rounded text-[10px] text-gray-400 font-mono text-center">
                                ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={!userName.trim() || showStamp}
                                className={`
                            w-full py-3 rounded-lg font-black text-white shadow-md flex items-center justify-center gap-2 transition-all
                            ${userName.trim() ? 'bg-pop-blue hover:bg-pop-blue/90 hover:-translate-y-1' : 'bg-gray-300 cursor-not-allowed'}
                        `}
                            >
                                承認申請 <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Stamp Animation */}
                        {showStamp && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-slight">
                                <div className="w-32 h-32 border-8 border-red-600 rounded-full flex items-center justify-center text-red-600 font-black text-xl rotate-[-15deg] opacity-80 shadow-lg bg-white/50 backdrop-blur-sm">
                                    <div className="flex flex-col items-center">
                                        <span>許可</span>
                                        <span className="text-xs">APPROVED</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Prologue;