
import React, { useState, useRef, useEffect } from 'react';
import { View, Notification, TeamMember, Project, Task } from '../types';
import { api } from '../services/api';

interface HeaderProps {
  currentView: View;
  onNewAction: () => void;
  onSearch: (query: string) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onNotificationClick: () => void;
  user?: TeamMember;
  onLogout?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
}

function HeaderAvatar({ user }: { user?: { name: string; avatar: string } }) {
  const [failed, setFailed] = useState(false);
  const initial = (user?.name || 'G')[0]?.toUpperCase();
  if (!user?.avatar || failed) {
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xs">
        {initial}
      </div>
    );
  }
  return <img src={user.avatar} className="w-9 h-9 rounded-full object-cover" alt={user.name} onError={() => setFailed(true)} />;
}

interface SearchResults {
  projects: Project[];
  tasks: Task[];
  members: TeamMember[];
}

const Header: React.FC<HeaderProps> = ({ currentView, onNewAction, onSearch, notifications, onMarkRead, onNotificationClick, user, onLogout, onNavigateToProfile, onNavigateToSettings }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim().length < 2) { setShowSearch(false); setSearchResults(null); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await api.search(value.trim());
        setSearchResults(results);
        setShowSearch(true);
      } catch (e) { console.error(e); }
    }, 300);
  };

  const totalResults = searchResults ? (searchResults.projects?.length || 0) + (searchResults.tasks?.length || 0) + (searchResults.members?.length || 0) : 0;

  return (
    <header className="h-20 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 z-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentView}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name?.split(' ')[0] || 'Guest'}.</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative hidden lg:block" ref={searchRef}>
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary w-80 placeholder-slate-400 transition-all font-medium"
            placeholder="Search projects, tasks, members..."
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onSearch(searchQuery); setShowSearch(false); }
              if (e.key === 'Escape') setShowSearch(false);
            }}
            onFocus={() => { if (searchResults && totalResults > 0) setShowSearch(true); }}
          />

          {/* Search Results Dropdown */}
          {showSearch && searchResults && (
            <div className="absolute top-full mt-2 w-96 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {totalResults === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <span className="material-icons-outlined text-2xl mb-1 block">search_off</span>
                  <p className="text-xs font-bold">No results for "{searchQuery}"</p>
                </div>
              ) : (
                <>
                  {searchResults.projects?.length > 0 && (
                    <div className="p-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Projects ({searchResults.projects.length})</p>
                      {searchResults.projects.map(p => (
                        <button key={p.id} onClick={() => { onSearch('projects'); setShowSearch(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><span className="material-icons-outlined text-lg">folder</span></span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{p.status} • {p.memberCount} members</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks?.length > 0 && (
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Tasks ({searchResults.tasks.length})</p>
                      {searchResults.tasks.map(t => (
                        <button key={t.id} onClick={() => { onSearch('my tasks'); setShowSearch(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'Done' ? 'bg-green-500' : t.status === 'In Progress' ? 'bg-primary' : 'bg-slate-400'}`}></span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{t.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{t.status} • {t.priority}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.members?.length > 0 && (
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Members ({searchResults.members.length})</p>
                      {searchResults.members.map(m => (
                        <button key={m.id} onClick={() => { onSearch('team'); setShowSearch(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                            {(m.name || 'U')[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{m.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{m.role || 'Member'} • {m.department || ''}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
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
                  <div className="p-8 text-center text-slate-400">
                    <span className="material-icons-outlined text-3xl mb-2 block">notifications_none</span>
                    <p className="text-xs font-bold">No notifications yet</p>
                  </div>
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

        {/* New Project button */}
        <button
          onClick={onNewAction}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-xl shadow-primary/30 transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-icons-outlined text-sm font-black">add</span>
          New Project
        </button>

        {/* User dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <HeaderAvatar user={user} />
            <span className="material-icons-outlined text-slate-400 text-sm">{showUserMenu ? 'expand_less' : 'expand_more'}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Guest'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.role || 'Member'}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { onNavigateToProfile?.(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <span className="material-icons-outlined text-lg">person</span>
                  My Profile
                </button>
                <button
                  onClick={() => { onNavigateToSettings?.(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <span className="material-icons-outlined text-lg">settings</span>
                  Settings
                </button>
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { onLogout?.(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left"
                >
                  <span className="material-icons-outlined text-lg">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
