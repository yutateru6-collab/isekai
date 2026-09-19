import React from 'react';
import { Compass, BookOpen, NotebookPen } from 'lucide-react';
export default function BottomNav({ currentTab, onTabChange }: { currentTab: string; onTabChange: (id: string) => void }) {
  const items = [{ id: 'explore', label: '探索', icon: Compass }, { id: 'gallery', label: '図鑑', icon: BookOpen }, { id: 'journal', label: '記録', icon: NotebookPen }];
  return <nav aria-label="メインメニュー" className="main-nav">{items.map(item => <button key={item.id} aria-label={item.label} aria-current={currentTab === item.id ? 'page' : undefined} onClick={() => onTabChange(item.id)}><item.icon size={21} strokeWidth={currentTab === item.id ? 2.4 : 1.8} /><span>{item.label}</span></button>)}</nav>;
}
