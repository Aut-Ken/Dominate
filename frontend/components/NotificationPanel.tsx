import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface NotificationPanelProps {
    userId: string;
    onClose: () => void;
}

const TYPE_ICONS: Record<string, string> = {
    task_assigned: 'assignment_ind',
    task_completed: 'task_alt',
    comment_added: 'chat',
    mention: 'alternate_email',
};

const TYPE_COLORS: Record<string, string> = {
    task_assigned: '#2badee',
    task_completed: '#22c55e',
    comment_added: '#f59e0b',
    mention: '#ec4899',
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId, onClose }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, [userId]);

    const loadNotifications = async () => {
        try {
            const data = await api.getNotifications(userId);
            setNotifications(data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const markRead = async (id: string) => {
        await api.markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = async () => {
        await api.markAllNotificationsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'now';
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        return `${Math.floor(hrs / 24)}d`;
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="fixed top-20 right-6 w-[420px] max-h-[600px] bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl z-[100] flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="material-icons-outlined text-primary text-xl">notifications</span>
                    <h3 className="text-sm font-black">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                        <span className="material-icons-outlined text-sm text-slate-400">close</span>
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-icons-outlined text-4xl text-slate-200 dark:text-slate-700 block mb-2">notifications_none</span>
                        <p className="text-xs text-slate-400 font-bold">All caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => !n.read && markRead(n.id)}
                                className={`px-8 py-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: (TYPE_COLORS[n.type] || '#64748b') + '15' }}
                                >
                                    <span
                                        className="material-icons-outlined text-base"
                                        style={{ color: TYPE_COLORS[n.type] || '#64748b' }}
                                    >
                                        {TYPE_ICONS[n.type] || 'circle_notifications'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold">{n.title}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{n.message}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-[9px] font-black text-slate-300 uppercase">{formatTime(n.createdAt)}</span>
                                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
