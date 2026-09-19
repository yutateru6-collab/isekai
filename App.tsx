import React, { useEffect, useState } from 'react';
import { Book, Settings, Mail, Sunrise, Sun, Sunset, Moon, Trophy, X } from 'lucide-react';
import { APP_NAME, CREATURES, ITEMS } from './constants';
import { Creature, Item, SearchArea, TimeOfDay } from './types';
import { UNCLE_MESSAGES, UncleMessage } from './data/uncleMessages';
import { currentTimeOfDay, dailyNews, localDate, TOTAL_CREATURES } from './services/game';
import { useProgress } from './services/useProgress';
import CreatureDetailModal from './components/CreatureDetailModal';
import BottomNav from './components/BottomNav';
import Prologue from './components/Prologue';
import RealisticBook from './components/RealisticBook';
import TitleScreen from './components/TitleScreen';
import UncleMessageModal from './components/UncleMessageModal';
import IntroStoryModal from './components/IntroStoryModal';
import ExplorationView from './components/ExplorationView';
import GalleryView from './components/GalleryView';
import JournalView from './components/JournalView';
import InventoryModal from './components/InventoryModal';
import SettingsModal from './components/SettingsModal';

const TIME_ICONS = { [TimeOfDay.Morning]: Sunrise, [TimeOfDay.Day]: Sun, [TimeOfDay.Sunset]: Sunset, [TimeOfDay.Night]: Moon, [TimeOfDay.Any]: Sun };

export default function App() {
  const { progress, dispatch, saveError, saved, dismissError } = useProgress();
  const [screen, setScreen] = useState<'title' | 'intro' | 'prologue' | 'game'>('title');
  const [currentTab, setCurrentTab] = useState('explore');
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [activeArea, setActiveArea] = useState<SearchArea | null>(null);
  const [showNews, setShowNews] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState<UncleMessage | null>(null);
  const [notice, setNotice] = useState('');
  const [date, setDate] = useState(localDate);
  const [time, setTime] = useState<TimeOfDay>(currentTimeOfDay);
  const news = dailyNews(date);
  const inventory = progress.inventory.map(id => ITEMS.find(i => i.id === id)!).filter(Boolean);
  const buddyData = CREATURES.find(c => c.id === progress.buddyId);
  const buddy: Creature | null = buddyData ? { ...buddyData, role: 'buddy', syncRate: progress.bonds[buddyData.id] ?? 0 } : null;
  const count = progress.discoveredIds.length;
  const rate = Math.round(count / TOTAL_CREATURES * 100);
  const unread = UNCLE_MESSAGES.filter(m => m.milestone <= count && !progress.readMilestones.includes(m.milestone));
  const nextMilestone = UNCLE_MESSAGES.find(m => m.milestone > count);

  useEffect(() => {
    const timer = setInterval(() => setDate(localDate()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (screen !== 'game' || !progress.onboarded || date <= progress.lastRewardDate) return;
    dispatch({ type: 'daily', date, itemId: 'item_candy' });
    setNotice('今日の調査支給品：異世界のキャンディをバッグに入れました。');
  }, [screen, progress.onboarded, progress.lastRewardDate, date]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (message) closeMessage();
      else if (showSettings) setShowSettings(false);
      else if (showInventory) setShowInventory(false);
      else if (selectedCreature) setSelectedCreature(null);
      else if (showBook) setShowBook(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [message, showSettings, showInventory, selectedCreature, showBook]);

  function closeMessage() {
    if (message) dispatch({ type: 'read', milestone: message.milestone });
    setMessage(null);
  }
  function feed(item: Item) {
    if (!buddy) { setNotice('図鑑の発見済み生物を開き、「相棒にする」を選んでください。'); return; }
    if (buddy.syncRate >= 100) { setNotice('この相棒との絆は最大です。アイテムはバッグに残しました。'); return; }
    dispatch({ type: 'feed', id: item.id });
    setNotice(`${buddy.name}に${item.name}を渡しました。絆が深まった！`);
  }

  if (screen === 'title') return <TitleScreen hasSave={progress.onboarded} onStart={() => setScreen(progress.onboarded ? 'game' : 'intro')} />;
  if (screen === 'intro') return <IntroStoryModal onComplete={() => setScreen('prologue')} />;
  if (screen === 'prologue') return <Prologue onComplete={name => { dispatch({ type: 'register', name }); setScreen('game'); }} />;

  return <div className="min-h-screen font-maru pb-32 overflow-x-hidden relative" style={{ background: "linear-gradient(#3e272330,#3e272360), url('/image/home_bg_desk.png') center / cover fixed" }}>
    <header className="sticky top-0 z-30 bg-[#fffaf2]/95 backdrop-blur border-b-2 border-amber-200 py-3">
      <div className="mx-auto px-3 max-w-3xl flex gap-2 items-center justify-between">
        <div className="min-w-0">
          <h1 className="font-black text-lg sm:text-xl text-[#5d4037]">{APP_NAME}</h1>
          <div className="flex gap-2 items-center mt-1 text-xs font-bold">
            <span>発見 {count} / {TOTAL_CREATURES} 種</span>
            <div role="progressbar" aria-label="図鑑の完成度" aria-valuenow={rate} aria-valuemin={0} aria-valuemax={100} className="w-16 sm:w-24 h-2 bg-amber-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-600 transition-all" style={{ width: `${rate}%` }} /></div>
            <span>{rate}%</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => setShowBook(true)} aria-label="図鑑を開く" className="p-3 rounded-xl text-[#5d4037] hover:bg-amber-100"><Book size={22} /></button>
          <button onClick={() => setShowSettings(true)} aria-label="設定を開く" className="p-3 rounded-xl text-[#5d4037] hover:bg-amber-100"><Settings size={22} /></button>
        </div>
      </div>
    </header>
    <main className="mx-auto px-4 max-w-3xl mt-5 relative">
      {saveError && <div role="alert" className="bg-red-50 text-red-900 p-4 mb-4 rounded-xl border-2 border-red-300 flex gap-2"><p className="flex-1 text-sm">{saveError}</p><button aria-label="保存のお知らせを閉じる" onClick={dismissError}><X size={20} /></button></div>}
      {currentTab === 'explore' && <>
        <div className="flex justify-between items-center text-white text-xs font-bold mb-3 gap-2"><span>{progress.userName} 調査員</span><span>{saved ? '進捗は端末に自動保存' : '保存データを書き出してください'}</span></div>
        <div className="rounded-2xl bg-[#fffaf2] p-4 mb-4 shadow-sm border border-amber-200">
          {count === TOTAL_CREATURES ? <div><h2 className="flex items-center gap-2 text-lg font-black text-amber-800"><Trophy />図鑑完成！ 帰り道がつながった</h2><p className="text-sm mt-2">全{TOTAL_CREATURES}種類の観測を達成。最後の通信を開こう。これからも相棒との調査は続けられます。</p></div>
          : <div><h2 className="font-black">{count === 0 ? '最初の1体を見つけよう' : `次の通信まで、あと${nextMilestone ? nextMilestone.milestone - count : 0}種類`}</h2><p className="text-sm text-stone-600 mt-1">{count === 0 ? '「調査に出発」から場所を選び、パラレル・カムで撮影しよう。' : count < 5 ? '5種類を発見すると、世界の隙間への道が開きます。' : '図鑑のスケッチに、生息地と観測時間のヒントがあります。'}</p></div>}
          {unread.length > 0 && <button onClick={() => setMessage(unread[0])} className="mt-3 bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Mail size={18} />叔父さんからの新着通信（{unread.length}）</button>}
        </div>
        <ExplorationView showNews={showNews} setShowNews={setShowNews} newsMessage={news} buddy={buddy} inventory={inventory} setShowInventory={setShowInventory}
          timeConfig={{ label: time, icon: TIME_ICONS[time] }} currentTime={time} onTimeChange={setTime}
          handleBuddyInteraction={e => { e.stopPropagation(); dispatch({ type: 'pet' }); }}
          discoveredIds={progress.discoveredIds} onCapture={id => dispatch({ type: 'capture', id })} onFindItem={id => dispatch({ type: 'item', id })}
          onCreatureClick={setSelectedCreature} activeArea={activeArea} onAreaSelect={setActiveArea} />
      </>}
      {currentTab === 'gallery' && <GalleryView favorites={progress.favorites} discoveredIds={progress.discoveredIds} setShowBook={setShowBook} onCreatureClick={setSelectedCreature} />}
      {currentTab === 'journal' && <>
        <section className="bg-[#fffaf2] p-5 rounded-3xl mb-5 shadow-card border-2 border-amber-200">
          <h2 className="text-xl font-black mb-3 flex gap-2 items-center"><Mail />叔父さんとの通信記録</h2>
          <div className="space-y-2">{UNCLE_MESSAGES.map(m => <button key={m.milestone} disabled={count < m.milestone} onClick={() => setMessage(m)} className="block w-full text-left rounded-xl p-3 bg-white border border-amber-200 disabled:opacity-50 font-bold text-sm">{count >= m.milestone ? `${progress.readMilestones.includes(m.milestone) ? '✉' : '● 新着'} ${m.subject}` : `${m.milestone}種類の発見で届く通信`}</button>)}</div>
          <p className="text-xs mt-4 text-stone-500">撮影成功 {progress.captures} 回 ・ 発見 {count} 種類</p>
        </section>
        <JournalView favorites={progress.favorites} onCreatureClick={setSelectedCreature} />
      </>}
    </main>
    {!activeArea && <BottomNav currentTab={currentTab} onTabChange={tab => { setCurrentTab(tab); window.scrollTo(0, 0); }} />}
    {showBook && <RealisticBook creatures={CREATURES} discoveredIds={progress.discoveredIds} onClose={() => setShowBook(false)} />}
    <CreatureDetailModal creature={selectedCreature} onClose={() => setSelectedCreature(null)} isFavorite={!!selectedCreature && progress.favorites.includes(selectedCreature.id)} onToggleFavorite={id => dispatch({ type: 'favorite', id })}
      userName={progress.userName} onSetBuddy={c => { dispatch({ type: 'buddy', id: c.id }); setNotice(`${c.name}が相棒になりました。ホームでふれあえます。`); }} buddyId={progress.buddyId} isLocked={!!selectedCreature && !progress.discoveredIds.includes(selectedCreature.id)} />
    <InventoryModal isOpen={showInventory} onClose={() => setShowInventory(false)} inventory={inventory} onUseItem={feed} />
    {showSettings && <SettingsModal progress={progress} onClose={() => setShowSettings(false)} onRestore={p => { dispatch({ type: 'restore', progress: p }); setSelectedCreature(null); setActiveArea(null); setCurrentTab('explore'); setScreen(p.onboarded ? 'game' : 'title'); setNotice('保存データを復元しました。'); }} />}
    {message && <UncleMessageModal key={message.milestone} message={message} onClose={closeMessage} userName={progress.userName} />}
    {notice && <div role="status" className="fixed bottom-24 left-4 right-4 mx-auto max-w-md z-[150] bg-slate-900 text-white p-4 rounded-2xl shadow-xl text-sm font-bold flex gap-2"><span className="flex-1">{notice}</span><button aria-label="お知らせを閉じる" onClick={() => setNotice('')}><X size={18} /></button></div>}
  </div>;
}
