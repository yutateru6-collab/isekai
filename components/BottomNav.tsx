
import React from 'react';
import { Compass, BookOpen, Heart } from 'lucide-react';
import { NavItem } from '../types';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (id: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const items: NavItem[] = [
    { id: 'explore', label: '探索', icon: Compass },
    { id: 'gallery', label: '図鑑', icon: BookOpen },
    { id: 'journal', label: '記録', icon: Heart },
  ];

  return (
    <nav aria-label="メインメニュー" className="fixed left-0 right-0 z-40 px-4 pointer-events-none flex justify-center" style={{ bottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <div className="bg-white rounded-full shadow-card border-4 border-white p-2 flex gap-2 pointer-events-auto items-center">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          
          // 色の設定
          let activeColorClass = 'bg-gray-800';
          let iconColorClass = 'text-white';
          
          if (item.id === 'explore') activeColorClass = 'bg-pop-green';
          if (item.id === 'gallery') activeColorClass = 'bg-pop-yellow';
          if (item.id === 'journal') activeColorClass = 'bg-pop-pink';

          return (
            <button
              key={item.id}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onTabChange(item.id)}
              className={`
                relative flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-full transition-all duration-300
                ${isActive 
                  ? `${activeColorClass} text-slate-900 shadow-pop -translate-y-1`
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }
              `}
            >
              <Icon 
                className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 3 : 2.5}
              />
              
              {(
                <span className="text-xs font-black tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
