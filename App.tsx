import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, Mail, Settings, Sparkles, X } from 'lucide-react';
import { APP_NAME, CREATURES, ITEMS } from './constants';
import { Creature, Item, SearchArea, TimeOfDay } from './types';
import { UNCLE_MESSAGES, UncleMessage } from './data/uncleMessages';
import { activeMission, MISSIONS, missionConditionsMet } from './data/missions';
import { BEHAVIOR_VARIANTS } from './data/behaviors';
import { currentTimeOfDay, dailyNews, localDate, TOTAL_CREATURES } from './services/game';
import { buddyReaction, memoryLabel } from './services/buddy';
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
import MissionCard from './components/MissionCard';
import BuddyView from './components/BuddyView';
import './styles/field.css';

export default function App() {
  const { progress, dispatch, saveError, saved, dismissError } = useProgress();
  const [screen, setScreen] = useState<'title' | 'intro' | 'prologue' | 'game'>('title');
  const [currentTab, setCurrentTab] = useState('explore');
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [activeArea, setActiveArea] = useState<SearchArea | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState<UncleMessage | null>(null);
  const [notice, setNotice] = useState('');
  const [date, setDate] = useState(localDate);
  const [time, setTime] = useState<TimeOfDay>(currentTimeOfDay);
  const interactionIndex = useRef(0);
  const news = dailyNews(date);
  const inventory = progress.inventory.map(id => ITEMS.find(i => i.id === id)!).filter(Boolean);
  const buddyData = CREATURES.find(c => c.id === progress.buddyId);
  const buddy: Creature | null = buddyData ? { ...buddyData, role: 'buddy', syncRate: progress.bonds[buddyData.id] ?? 0 } : null;
  const memories = buddy ? (progress.buddyMemories[buddy.id] ?? []).map(memoryLabel) : [];
  const petCountToday = date <= progress.petDate ? progress.petCount : 0;
  const postscript = MISSIONS.find(m => progress.completedMissionIds.includes(m.id) && !progress.seenMissionPostscriptIds.includes(m.id)) ?? null;
  const nextMission = activeMission(progress.completedMissionIds);
  // The next mission is not active invisibly while the player is reading a previous letter.
  const mission = postscript ? null : nextMission;
  const count = progress.discoveredIds.length;
  const rate = Math.round(count / TOTAL_CREATURES * 100);
  const unread = UNCLE_MESSAGES.filter(m => m.milestone <= count && !progress.readMilestones.includes(m.milestone));
  const nextMilestone = UNCLE_MESSAGES.find(m => m.milestone > count);
  const observedCount = Object.values(progress.observations).reduce((sum, ids) => sum + ids.length, 0);
  const totalBehaviors = Object.values(BEHAVIOR_VARIANTS).reduce((sum, variants) => sum + variants.length, 0);

  useEffect(() => {
    const refresh = () => setDate(localDate());
    const timer = setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  useEffect(() => {
    if (screen !== 'game' || !progress.onboarded || date <= progress.lastRewardDate) return;
    dispatch({ type: 'daily', date, itemId: 'item_candy' });
    setNotice('今日の調査支給品：異世界のキャンディをバッグに入れました。');
  }, [screen, progress.onboarded, progress.lastRewardDate, date]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
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
    if (mission?.requiredItemId === item.id && inventory.filter(i => i.id === item.id).length === 1) { setNotice('この道具は今の調査依頼に使います。最後の1個はバッグに残しました。'); return; }
    dispatch({ type: 'feed', id: item.id });
    setNotice(`${buddy.name}に${item.name}を渡しました。絆が深まった！`);
  }
  function petBuddy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!buddy) return;
    const today = localDate(); setDate(today);
    const used = today <= progress.petDate ? progress.petCount : 0;
    const reaction = buddyReaction(buddy, interactionIndex.current++);
    if (today < progress.petDate || used >= 3) { setNotice(`${reaction} 絆が深まるふれあいは今日はおしまい。また明日。`); return; }
    dispatch({ type: 'pet', date: today });
    setNotice(`${reaction}${buddy.syncRate >= 100 ? ' 最高の相棒との時間を楽しんだ。' : ` 絆が深まった！（今日 ${used + 1}/3）`}`);
  }
  function captureCreature(id: string, behaviorVariantId?: string) {
    dispatch({ type: 'capture', id, behaviorVariantId });
    if (mission && activeArea && missionConditionsMet(mission, id, activeArea.id, time, progress.inventory)) {
      dispatch({ type: 'missionComplete', id: mission.id });
    }
  }
  function changeTab(tab: string) { setCurrentTab(tab); window.scrollTo({ top: 0 }); }

  if (screen === 'title') return <TitleScreen hasSave={progress.onboarded} onStart={() => setScreen(progress.onboarded ? 'game' : 'intro')} />;
  if (screen === 'intro') return <IntroStoryModal onComplete={() => setScreen('prologue')} />;
  if (screen === 'prologue') return <Prologue onComplete={name => { dispatch({ type: 'register', name }); setScreen('game'); }} />;

  return <div className="zukan-app">
    <header className="zukan-header"><div className="zukan-header-inner"><div className="zukan-brand"><p className="field-eyebrow">PARALLEL FIELD NOTES</p><h1>{APP_NAME}</h1><div className="zukan-progress"><span>発見 {count} / {TOTAL_CREATURES} 種</span><span role="progressbar" aria-label="図鑑の完成度" aria-valuenow={rate} aria-valuemin={0} aria-valuemax={100} className="zukan-progress-track"><span style={{ width: `${rate}%` }} /></span><span>{rate}%</span></div></div><div className="header-actions"><button className="icon-action" onClick={() => setShowBook(true)} aria-label="本の図鑑を開く"><BookOpen size={21} /></button><button className="icon-action" onClick={() => setShowSettings(true)} aria-label="設定を開く"><Settings size={21} /></button></div></div></header>
    <main className="zukan-main">
      {saveError && <div role="alert" className="save-warning"><p>{saveError}</p><button className="icon-action" aria-label="保存のお知らせを閉じる" onClick={dismissError}><X size={20} /></button></div>}
      {currentTab === 'explore' && <>
        <div className="home-meta"><span>{progress.userName} 調査員</span><span><Check size={13} />{saved ? 'この端末に保存済み' : '保存データの書き出しを推奨'}</span></div>
        <div className="home-progress-strip"><span>{count === TOTAL_CREATURES ? '図鑑完成！ 帰り道がつながった' : `次の通信まで、あと${nextMilestone ? nextMilestone.milestone - count : 0}種類`}</span>{unread.length > 0 && <button onClick={() => setMessage(unread[0])}><Mail size={15} />新着通信 {unread.length}</button>}</div>
        <div className="home-grid">
          <MissionCard mission={nextMission} completedCount={progress.completedMissionIds.length} total={MISSIONS.length} postscript={postscript} onAcknowledgePostscript={id => dispatch({ type: 'missionSeen', id })} onDepart={() => setMenuOpen(true)} inventoryIds={progress.inventory} />
          <aside className="home-companion"><BuddyView buddy={buddy} memoryLabels={memories} dailyPetCount={petCountToday} onBuddyInteraction={petBuddy} onOpenInventory={() => setShowInventory(true)} onOpenGallery={() => changeTab('gallery')} />
            <div className="home-small-note"><Sparkles size={18} /><p>いつもの景色を、もう一度。<small>同じ生物にも新しい生態があります。観測記録 {observedCount} / {totalBehaviors}</small></p></div>
            {!nextMission && !postscript && <details className="forecast-note"><summary>今日のバイオ予報</summary><p>{news.content}</p></details>}
          </aside>
        </div>
        <ExplorationView newsMessage={news} activeMission={mission} inventory={inventory} currentTime={time} onTimeChange={setTime} discoveredIds={progress.discoveredIds} observations={progress.observations} onCapture={captureCreature} onFindItem={id => dispatch({ type: 'item', id })} onStartExpedition={areaId => dispatch({ type: 'expedition', areaId })} onCreatureClick={setSelectedCreature} activeArea={activeArea} onAreaSelect={setActiveArea} menuOpen={menuOpen} onMenuChange={setMenuOpen} />
      </>}
      {currentTab === 'gallery' && <GalleryView favorites={progress.favorites} discoveredIds={progress.discoveredIds} setShowBook={setShowBook} onCreatureClick={setSelectedCreature} />}
      {currentTab === 'journal' && <div className="journal-layout">
        <section className="journal-panel"><p className="field-eyebrow">LETTERS FROM UNCLE</p><h2>叔父さんとの通信記録</h2><div className="journal-letter-list">{UNCLE_MESSAGES.map(m => <button key={m.milestone} disabled={count < m.milestone} onClick={() => setMessage(m)}>{count >= m.milestone ? `${progress.readMilestones.includes(m.milestone) ? '✉' : '● 新着'} ${m.subject}` : `${m.milestone}種類の発見で届く通信`}</button>)}</div><p className="journal-footnote">撮影成功 {progress.captures}回 ／ 発見 {count}種類</p></section>
        <section className="journal-panel"><p className="field-eyebrow">INVESTIGATION ARCHIVE</p><h2>調査依頼と追伸 <small>{progress.completedMissionIds.length} / {MISSIONS.length}</small></h2>{progress.completedMissionIds.length ? MISSIONS.filter(m => progress.completedMissionIds.includes(m.id)).map(m => <details className="archive-letter" key={m.id}><summary><Check size={16} />{m.title}</summary><p>{m.postscript}</p></details>) : <p>最初の依頼を達成すると、叔父さんの追伸がここにも残ります。</p>}</section>
        <section className="journal-panel"><p className="field-eyebrow">BEHAVIOR OBSERVATIONS</p><h2>新しい生態の記録 <small>{observedCount} / {totalBehaviors}</small></h2><p className="journal-footnote">33種類の図鑑完成率とは別の記録です。</p>{observedCount ? Object.entries(progress.observations).map(([id, variants]) => { const c = CREATURES.find(c => c.id === id); if (!c || !variants.length) return null; return <div className="ecology-entry" key={id}><button onClick={() => setSelectedCreature(c)}>{c.name}の観測ノート</button>{BEHAVIOR_VARIANTS[id]?.filter(v => variants.includes(v.id)).map(v => <p key={v.id}><strong>{v.label}</strong> {v.description}</p>)}</div>; }) : <p>発見済みの生物をもう一度観測すると、新しい行動が見つかることがあります。</p>}</section>
        <JournalView favorites={progress.favorites} onCreatureClick={setSelectedCreature} />
      </div>}
    </main>
    {!activeArea && !menuOpen && <BottomNav currentTab={currentTab} onTabChange={changeTab} />}
    {showBook && <RealisticBook creatures={CREATURES} discoveredIds={progress.discoveredIds} onClose={() => setShowBook(false)} />}
    <CreatureDetailModal creature={selectedCreature} onClose={() => setSelectedCreature(null)} isFavorite={!!selectedCreature && progress.favorites.includes(selectedCreature.id)} onToggleFavorite={id => dispatch({ type: 'favorite', id })} userName={progress.userName} onSetBuddy={c => { dispatch({ type: 'buddy', id: c.id }); setNotice(`${c.name}が相棒になりました。ホームでふれあえます。`); }} buddyId={progress.buddyId} isLocked={!!selectedCreature && !progress.discoveredIds.includes(selectedCreature.id)} observedIds={selectedCreature ? progress.observations[selectedCreature.id] ?? [] : []} />
    <InventoryModal isOpen={showInventory} onClose={() => setShowInventory(false)} inventory={inventory} onUseItem={feed} />
    {showSettings && <SettingsModal progress={progress} onClose={() => setShowSettings(false)} onRestore={p => { dispatch({ type: 'restore', progress: p }); setSelectedCreature(null); setActiveArea(null); setMenuOpen(false); setCurrentTab('explore'); setScreen(p.onboarded ? 'game' : 'title'); setNotice('保存データを復元しました。'); }} />}
    {message && <UncleMessageModal key={message.milestone} message={message} onClose={closeMessage} userName={progress.userName} />}
    {notice && <div role="status" className="zukan-toast"><span>{notice}</span><button className="icon-action" aria-label="お知らせを閉じる" onClick={() => setNotice('')}><X size={18} /></button></div>}
  </div>;
}
