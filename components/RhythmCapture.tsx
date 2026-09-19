import React, { useEffect, useRef, useState } from 'react';
import { Creature } from '../types';
import { Camera, X } from 'lucide-react';

interface Note { id: number; x: number; born: number; y: number }
const TARGET = 74;
const REQUIRED = 8;
export default function RhythmCapture({ creature, onCapture, onEscape }: { creature: Creature; onCapture: () => void; onEscape: () => void }) {
  const [status, setStatus] = useState<'ready' | 'playing' | 'success' | 'fail'>('ready');
  const [relaxed, setRelaxed] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [hits, setHits] = useState(0);
  const [seconds, setSeconds] = useState(20);
  const [feedback, setFeedback] = useState('');
  const runtime = useRef({ notes: [] as Note[], elapsed: 0, last: 0, nextSpawn: 0, id: 0, hits: 0, done: false });
  const surface = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== 'playing') return;
    surface.current?.focus();
    let frame = 0;
    const game = runtime.current;
    const tick = (now: number) => {
      if (game.done) return;
      // Pause while backgrounded; don't punish a phone notification or hidden tab.
      const delta = game.last ? Math.min(50, now - game.last) : 0;
      game.last = now;
      if (!document.hidden) game.elapsed += delta;
      if (game.elapsed >= game.nextSpawn && game.notes.length < 12) {
        game.notes.push({ id: game.id++, x: 25 + Math.random() * 50, born: game.elapsed, y: -5 });
        game.nextSpawn = game.elapsed + (relaxed ? 1400 : 850);
      }
      game.notes = game.notes.map(n => ({ ...n, y: Math.min(relaxed ? TARGET : 110, -5 + (game.elapsed - n.born) / (relaxed ? 65 : 38)) })).filter(n => n.y < 108);
      setNotes([...game.notes]);
      setSeconds(Math.max(0, Math.ceil((20000 - game.elapsed) / 1000)));
      if (!relaxed && game.elapsed >= 20000) { game.done = true; setStatus('fail'); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, relaxed]);
  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(onCapture, 800);
    return () => clearTimeout(timer);
  }, [status, onCapture]);

  function start(slow: boolean) {
    runtime.current = { notes: [], elapsed: 0, last: 0, nextSpawn: 0, id: 0, hits: 0, done: false };
    setHits(0); setNotes([]); setSeconds(20); setFeedback(''); setRelaxed(slow); setStatus('playing');
  }
  function tap() {
    const game = runtime.current;
    if (status !== 'playing' || game.done) return;
    const nearest = game.notes.filter(n => Math.abs(n.y - TARGET) <= (relaxed ? 10 : 7)).sort((a, b) => Math.abs(a.y - TARGET) - Math.abs(b.y - TARGET))[0];
    if (!nearest) { setFeedback('線に重なったらタップ！'); return; }
    game.notes = game.notes.filter(n => n.id !== nearest.id);
    game.hits += 1;
    setNotes([...game.notes]); setHits(game.hits); setFeedback('いいタイミング！');
    if (game.hits >= REQUIRED) { game.done = true; setStatus('success'); }
  }
  return <div ref={surface} tabIndex={0} role="region" aria-label="パラレル・カム撮影" className="fixed inset-0 z-50 bg-slate-950 text-white touch-manipulation overflow-hidden outline-none"
    onPointerDown={tap} onKeyDown={e => { if ((e.code === 'Space' || e.code === 'Enter') && e.target === e.currentTarget && !e.repeat) { e.preventDefault(); tap(); } }}>
    <img src={creature.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-md pointer-events-none" />
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><img src={creature.imageUrl} alt={creature.name} className="w-[85%] max-w-md max-h-[55dvh] object-contain rounded-3xl opacity-70" /></div>
    <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center gap-3 bg-black/50">
      <Camera className="shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{creature.name}</p><p className="text-xs">撮影 {hits} / {REQUIRED} ・ {relaxed ? '時間制限なし' : `残り ${seconds} 秒`}</p><div className="h-2 bg-white/20 rounded-full mt-2 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${hits / REQUIRED * 100}%` }} /></div></div>
      <button aria-label="撮影をやめる" className="p-3" onPointerDown={e => e.stopPropagation()} onClick={onEscape}><X /></button>
    </div>
    {status === 'playing' && <>
      <div className="absolute left-4 right-4 h-1 bg-white pointer-events-none shadow-[0_0_15px_white]" style={{ top: `${TARGET}%` }} />
      {notes.map(n => <div key={n.id} data-note-y={n.y.toFixed(2)} aria-hidden="true" className="absolute w-12 h-12 bg-emerald-300 rounded-full border-4 border-white shadow-[0_0_25px_#6ee7b7] pointer-events-none" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%,-50%)' }} />)}
      <div className="absolute bottom-8 left-4 right-4 text-center pointer-events-none"><p className="font-black text-lg">{feedback || '光が白い線に重なったらタップ'}</p><p className="text-xs text-white/70 mt-2">画面のどこでもタップ ／ キーボードはスペース</p></div>
    </>}
    {status === 'success' && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><h2 role="status" className="text-4xl font-black text-amber-300">撮影成功！</h2></div>}
    {(status === 'ready' || status === 'fail') && <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-[#fffaf2] text-[#5d4037] rounded-3xl p-6 max-w-sm w-full text-center" onPointerDown={e => e.stopPropagation()}>
        <Camera className="mx-auto mb-3" size={40} /><h2 className="text-2xl font-black">{status === 'fail' ? 'もう一度チャレンジ' : 'パラレル・カムで撮影'}</h2>
        <p className="text-sm leading-6 my-4">落ちてくる光が白い線に重なったら、画面をタップ。{REQUIRED}回成功で図鑑に記録できます。</p>
        <button onClick={() => start(false)} className="w-full bg-emerald-700 text-white rounded-xl p-3 font-bold mb-3">撮影スタート（20秒）</button>
        <button onClick={() => start(true)} className="w-full bg-amber-100 rounded-xl p-3 font-bold">ゆっくり撮影（時間制限なし）</button>
        <p className="text-xs mt-3 text-stone-500">ゆっくり撮影では、光が線の上で待ってくれます。</p>
      </div>
    </div>}
  </div>;
}
