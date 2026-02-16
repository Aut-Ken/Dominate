
import React, { useState } from 'react';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  onProfileClick: () => void;
  myTasksCount: number;
  user?: { name: string; role: string; avatar: string };
}

function UserAvatar({ user }: { user?: { name: string; avatar: string } }) {
  const [failed, setFailed] = useState(false);
  const initial = (user?.name || 'G')[0]?.toUpperCase();
  if (!user?.avatar || failed) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-sm border-2 border-primary/20">
        {initial}
      </div>
    );
  }
  return <img alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" src={user.avatar} onError={() => setFailed(true)} />;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onProfileClick, myTasksCount, user }) => {
  return (
    <aside className="w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex">
      <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-icons-outlined text-xl font-bold">bolt</span>
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Dominate</span>
        </div>
      </div>

      <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const badgeValue = item.view === View.MY_TASKS ? myTasksCount : undefined;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === item.view
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span className="material-icons-outlined text-xl">{item.icon}</span>
              <span className="flex-1 text-left">{item.view}</span>
              {badgeValue !== undefined && badgeValue > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeView === item.view
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
        >
          <UserAvatar user={user} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Guest'}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.role || 'Visitor'}</p>
          </div>
          <span className="material-icons-outlined text-slate-400 text-sm group-hover:text-primary transition-transform group-hover:translate-x-1">arrow_forward_ios</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
