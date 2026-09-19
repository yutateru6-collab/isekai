
import React, { useState, useEffect, useRef } from 'react';
import { Creature, ChatMessage } from '../types';
import { X, Play, Image as ImageIcon, Sparkles, Heart, Star, MessageCircle, Send, Bot, FileText, Activity } from 'lucide-react';
import { decipherCreatureLore, chatWithDoctor } from '../services/localCreatureService';

interface CreatureDetailModalProps {
  creature: Creature | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  userName: string;
  onSetBuddy: (creature: Creature) => void;
  buddyId: string | null;
  isLocked?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "主な生息地は？",
  "好物は何ですか？",
  "人間への危険性は？",
  "弱点はありますか？"
];

const CreatureDetailModal: React.FC<CreatureDetailModalProps> = ({ creature, onClose, isFavorite, onToggleFavorite, userName, onSetBuddy, buddyId, isLocked = false }) => {
  const [activeTab, setActiveTab] = useState<'sketch' | 'art' | 'real'>('art');
  const [mode, setMode] = useState<'info' | 'chat'>('info');
  const [lore, setLore] = useState<string | null>(null);
  const [isLoadingLore, setIsLoadingLore] = useState(false);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (creature) {
      setLore(null);
      setChatHistory([]);
      setMode('info');
      // If locked, force sketch. Else default to Art.
      setActiveTab(isLocked ? 'sketch' : 'art');
    }
  }, [creature, isLocked]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, mode]);

  if (!creature) return null;

  const handleDecipher = async () => {
    setIsLoadingLore(true);
    const text = await decipherCreatureLore(creature);
    setLore(text);
    setIsLoadingLore(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    const response = await chatWithDoctor(creature, text, userName);

    const docMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'doctor', text: response };
    setChatHistory(prev => [...prev, docMsg]);
    setIsChatLoading(false);
  };

  const currentImage = activeTab === 'sketch' ? (creature.sketchUrl || creature.imageUrl)
    : activeTab === 'real' ? creature.realImageUrl
      : creature.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 font-maru">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-pop-purple/30 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Card Container */}
      <div className="relative w-full max-w-4xl h-[85vh] bg-white shadow-2xl rounded-[40px] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 ring-8 ring-white/50 border-4 border-white">

        {/* Left Side: Visuals */}
        <div className="relative md:w-1/2 bg-pastel-blue p-6 flex flex-col h-[40%] md:h-full shrink-0 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-pop-blue/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-pop-green/20 rounded-full blur-3xl"></div>

          {/* Header Controls */}
          {!isLocked && (
            <div className="absolute top-4 left-4 z-20">
              <button
                onClick={() => onToggleFavorite(creature.id)}
                className={`p-3 rounded-full transition-all duration-300 shadow-pop border-2 border-white ${isFavorite ? 'bg-pop-pink text-white scale-110' : 'bg-white text-gray-300 hover:text-pop-pink'}`}
                title="お気に入りに追加"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Buddy Button */}
              <button
                onClick={() => onSetBuddy(creature)}
                disabled={buddyId === creature.id}
                className={`mt-2 p-3 rounded-full transition-all duration-300 shadow-pop border-2 border-white flex items-center justify-center ${buddyId === creature.id
                  ? 'bg-pop-green text-white cursor-default'
                  : 'bg-white text-gray-300 hover:text-pop-green hover:scale-110'
                  }`}
                title="相棒にする"
              >
                <Star className={`w-6 h-6 ${buddyId === creature.id ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          {/* Image Frame */}
          <div className="relative w-full h-full bg-white rounded-3xl shadow-card mt-0 md:mt-8 overflow-hidden border-4 border-white group flex items-center justify-center bg-gray-50">
            {currentImage ? (
              <img
                src={currentImage}
                alt={creature.name}
                className={`w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 ${activeTab === 'sketch' ? 'sepia-[.3]' : ''}`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
                <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                <p className="font-bold text-sm">NO IMAGE</p>
              </div>
            )}

            {/* Level Badge */}
            {!isLocked && (
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-kids-text px-4 py-2 rounded-full text-xs font-black shadow-sm flex items-center gap-1 border border-white">
                レア度
                <span className="flex gap-0.5">
                  {[...Array(creature.dangerLevel)].map((_, i) => <Star key={i} className="w-4 h-4 text-pop-yellow fill-pop-yellow" />)}
                </span>
              </div>
            )}

            {/* Target Badge for Locked items */}
            {isLocked && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full font-black border-2 border-white shadow-pop rotate-6 animate-pulse z-10">
                TARGET
              </div>
            )}
          </div>

          {/* Media Switcher */}
          <div className="hidden md:flex justify-center mt-6 gap-2 relative z-10">
            {/* Sketch Tab */}
            <button
              onClick={() => setActiveTab('sketch')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-full transition-all border-2 border-transparent ${activeTab === 'sketch' ? 'bg-[#8D6E63] text-white shadow-pop' : 'bg-white text-gray-400 hover:bg-white/80'}`}
            >
              <FileText className="w-4 h-4" />
              スケッチ
            </button>

            {/* Art Tab (Locked if !unlocked) */}
            <button
              onClick={() => setActiveTab('art')}
              // disabled={isLocked} // DISABLED for testing
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-full transition-all border-2 border-transparent ${activeTab === 'art'
                ? 'bg-pop-blue text-white shadow-pop'
                : 'bg-white text-gray-400 hover:bg-white/80'
                }`}
            >
              <ImageIcon className="w-4 h-4" />
              観測記録
            </button>

            {/* Real Tab (Only if exists and unlocked) */}
            {creature.realImageUrl && (
              <button
                onClick={() => setActiveTab('real')}
                // disabled={isLocked} // DISABLED for testing
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-full transition-all border-2 border-transparent ${activeTab === 'real'
                  ? 'bg-pop-pink text-white shadow-pop'
                  : 'bg-white text-gray-400 hover:bg-white/80'
                  }`}
              >
                <div className="w-4 h-4 border-2 border-current rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                </div>
                実写
              </button>
            )}

            {/* Video Tab (Placeholder) */}
            <button
              onClick={() => { }}
              disabled={true}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black rounded-full transition-all border-2 border-transparent bg-gray-100 text-gray-300 cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              映像(未)
            </button>
          </div>
        </div>

        {/* Right Side: Description & Chat */}
        <div className="relative md:w-1/2 flex flex-col h-full bg-white overflow-hidden">

          {/* Header Area */}
          <div className="p-6 pb-2 shrink-0 bg-white z-10">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 bg-gray-100 p-2 rounded-full text-gray-400 hover:bg-pop-pink hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-4">
              <div className="inline-block bg-pastel-green text-pop-green px-3 py-1 rounded-full text-xs font-black mb-2 tracking-wide">
                {creature.type}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-kids-text mb-1 tracking-tight">{creature.name}</h2>
              <p className="text-xs text-gray-400 font-serif italic">{creature.latinName}</p>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2 mb-2 bg-gray-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setMode('info')}
                className={`flex-1 py-2 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${mode === 'info' ? 'bg-white text-kids-text shadow-sm' : 'text-gray-400 hover:bg-gray-200'}`}
              >
                <FileText className="w-4 h-4" />
                調査データ
              </button>
              <button
                onClick={() => {
                  setMode('chat');
                  if (chatHistory.length === 0) {
                    setChatHistory([{
                      id: 'init',
                      sender: 'doctor',
                      text: `やあ！私は「パラレル生物博士」だ。\n${creature.name}について、何か質問はあるかね？`
                    }]);
                  }
                }}
                className={`flex-1 py-2 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${mode === 'chat' ? 'bg-pop-purple text-white shadow-sm' : 'text-gray-400 hover:bg-gray-200'}`}
              >
                <MessageCircle className="w-4 h-4" />
                博士に質問
              </button>
            </div>
          </div>

          {/* Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 bg-dots">

            {mode === 'info' ? (
              <div className="animate-in slide-in-from-right-4 duration-300">
                {/* Main Description */}
                <div className="bg-white p-6 rounded-3xl mb-6 text-kids-text leading-relaxed font-bold shadow-sm border-2 border-gray-100 relative mt-2">
                  <div className="absolute -top-3 -left-2 text-5xl text-pastel-blue">❝</div>
                  {creature.shortDesc}
                </div>

                {/* AI Lore Section */}
                <div className="relative">
                  {!lore ? (
                    <button
                      onClick={handleDecipher}
                      disabled={isLoadingLore}
                      className="group w-full border-4 border-dashed border-pop-yellow bg-pastel-yellow/30 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-pastel-yellow transition-all cursor-pointer"
                    >
                      <div className={`p-4 rounded-full bg-pop-yellow text-white shadow-pop ${isLoadingLore ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`}>
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <span className="block text-lg font-black text-kids-text mb-1">
                          {isLoadingLore ? 'データ解析中...' : '詳細データを解析する'}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          AIを使って詳しい生態を調べる
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="relative bg-white p-6 rounded-3xl shadow-pop border-4 border-pop-yellow animate-in slide-in-from-bottom-2">
                      <div className="flex items-start gap-4">
                        <div className="bg-pop-yellow p-3 rounded-2xl shrink-0 shadow-sm">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="block text-xs font-black text-pop-yellow mb-2 bg-pastel-yellow inline-block px-2 py-1 rounded-md">
                            解析結果
                          </span>
                          <div className="text-sm text-gray-700 leading-7 font-medium whitespace-pre-wrap">
                            {lore}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                <div className="flex-1 space-y-4 pb-4 pt-2">
                  {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'doctor' && (
                        <div className="w-8 h-8 rounded-full bg-pop-purple flex items-center justify-center text-white mr-2 mt-1 shrink-0">
                          <Bot className="w-5 h-5" />
                        </div>
                      )}
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold leading-relaxed whitespace-pre-wrap shadow-sm ${msg.sender === 'user'
                        ? 'bg-pop-blue text-white rounded-tr-none'
                        : 'bg-white text-kids-text rounded-tl-none border-2 border-gray-100'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start items-center">
                      <div className="w-8 h-8 rounded-full bg-pop-purple flex items-center justify-center text-white mr-2 shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none border-2 border-gray-100 flex gap-1 shadow-sm">
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="mt-auto bg-white/80 backdrop-blur p-1 rounded-2xl">
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSendMessage(q)}
                        disabled={isChatLoading}
                        className="whitespace-nowrap px-4 py-2 bg-white border-2 border-pop-blue text-pop-blue text-xs font-black rounded-full hover:bg-pop-blue hover:text-white transition-colors shrink-0"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                      placeholder="質問を入力してください"
                      className="w-full pl-5 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:border-pop-purple transition-all"
                      disabled={isChatLoading}
                    />
                    <button
                      onClick={() => handleSendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isChatLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pop-purple text-white rounded-xl disabled:opacity-50 disabled:bg-gray-300 hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </button>
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

export default CreatureDetailModal;