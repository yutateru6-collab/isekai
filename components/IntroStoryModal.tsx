import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface IntroStoryModalProps {
    onComplete: () => void;
}

const IntroStoryModal: React.FC<IntroStoryModalProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        setFadeIn(true);
    }, []);

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const stories = [
        "僕の叔父さんは、ちょっと変わっている。\n親戚の集まりには顔を出さず、\n世界中を旅しては、変な石や干しトカゲを送りつけてくるんだ。",
        "「この世界には、まだ誰も知らない『隙間』があるんだよ」\n\n叔父さんは、子供みたいな顔でそう語っていた。\n周りの大人は笑っていたけれど、僕だけは信じていた。",
        "そんな叔父さんが、ふらりと姿を消してから数ヶ月。\nある日、学校から帰ると、予感がした。\nランドセルを開ける。\nそこには……。"
    ];

    return (
        <div
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center font-maru"
            onClick={handleNext}
        >
            <div className={`relative w-full h-full max-w-lg mx-auto flex flex-col transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>

                {/* Image Area - Removed as per user request */}
                <div className="hidden"></div>

                {/* Text Area */}
                <div className="bg-black p-8 pb-20 text-white relative min-h-screen flex flex-col justify-center items-center">
                    <p className="text-2xl md:text-3xl leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-4 duration-500 font-bold tracking-wide" key={step}>
                        {stories[step]}
                    </p>

                    <button onClick={e => { e.stopPropagation(); handleNext(); }} className="absolute bottom-8 right-8 flex gap-2 items-center rounded-full border border-white/50 px-5 py-3 font-bold">
                        {step < 2 ? '次へ' : '手紙を開く'} <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntroStoryModal;
