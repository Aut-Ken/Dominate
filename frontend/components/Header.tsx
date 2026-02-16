
import React, { useState } from 'react';
import { View, Notification } from '../types';

interface HeaderProps {
  currentView: View;
  onNewAction: () => void;
  onSearch: (query: string) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onNotificationClick: () => void;
  user?: { name: string };
}

const Header: React.FC<HeaderProps> = ({ currentView, onNewAction, onSearch, notifications, onMarkRead, onNotificationClick, user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-20 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 z-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentView}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name.split(' ')[0] || 'Guest'}.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary w-80 placeholder-slate-400 transition-all font-medium"
            placeholder="Search projects, tasks, or views..."
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch(e.currentTarget.value);
            }}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-colors relative ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary'}`}
          >
            <span className="material-icons-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-sm font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkRead(n.id);
                        onNotificationClick();
                        setShowNotifications(false);
                      }}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 relative ${n.unread ? 'bg-primary/[0.03]' : ''}`}
                    >
                      {n.unread && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"></div>}
                      <div className="flex justify-between mb-1">
                        <p className={`text-xs font-bold ${n.unread ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{n.title}</p>
                        <p className="text-[10px] text-slate-400">{n.time}</p>
                      </div>
                      <p className="text-xs text-slate-500 leading-tight line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onNewAction}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-xl shadow-primary/30 transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-icons-outlined text-sm font-black">add</span>
          New Project
        </button>
      </div>
    </header>
  );
};

export default Header;
