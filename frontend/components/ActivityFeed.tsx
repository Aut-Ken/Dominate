import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ActivityFeedProps {
    projectId?: string;
}

const ACTION_ICONS: Record<string, string> = {
    created: 'add_circle',
    updated: 'edit',
    completed: 'check_circle',
    commented: 'chat_bubble',
    uploaded: 'upload_file',
    deleted: 'delete',
    assigned: 'person_add',
};

const ACTION_COLORS: Record<string, string> = {
    created: '#22c55e',
    updated: '#2badee',
    completed: '#8b5cf6',
    commented: '#f59e0b',
    uploaded: '#ec4899',
    deleted: '#ef4444',
    assigned: '#06b6d4',
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ projectId }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivity();
        const interval = setInterval(loadActivity, 30000);
        return () => clearInterval(interval);
    }, [projectId]);

    const loadActivity = async () => {
        try {
            const data = await api.getActivityLogs(projectId);
            setLogs(data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black tracking-tight">Activity Feed</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Recent Activity & Changes</p>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Loading activity...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-20 text-center">
                        <span className="material-icons-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4 block">history</span>
                        <p className="text-slate-400 font-bold">No activity yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {logs.map((log, idx) => (
                            <div
                                key={log.id}
                                className="px-8 py-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <div
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: (ACTION_COLORS[log.action] || '#64748b') + '15' }}
                                >
                                    <span
                                        className="material-icons-outlined text-lg"
                                        style={{ color: ACTION_COLORS[log.action] || '#64748b' }}
                                    >
                                        {ACTION_ICONS[log.action] || 'info'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-black">{log.userName}</span>
                                        <span className="text-slate-400 mx-1.5">{log.action}</span>
                                        <span className="font-bold text-primary">{log.target}</span>
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">{log.targetName}</p>
                                    {log.detail && (
                                        <p className="text-[11px] text-slate-400 mt-1">{log.detail}</p>
                                    )}
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider shrink-0">
                                    {formatTime(log.createdAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
