import React, { useState, useEffect, useRef } from 'react';
import { Task, Comment, TeamMember, TimeLog } from '../types';
import { api } from '../services/api';

interface TaskDetailModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    currentUser?: TeamMember;
    currentUserId: string | null;
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const API_HOST = 'http://localhost:8080';

function Avatar({ name, avatar, size = 'w-8 h-8' }: { name: string; avatar?: string; size?: string }) {
    const [failed, setFailed] = useState(false);
    const initial = (name || 'U')[0]?.toUpperCase();
    const imgSrc = avatar?.startsWith('/uploads') ? `${API_HOST}${avatar}` : avatar;
    if (!avatar || failed) {
        return (
            <div className={`${size} rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0`}>
                {initial}
            </div>
        );
    }
    return <img src={imgSrc} alt={name} className={`${size} rounded-full object-cover shrink-0`} onError={() => setFailed(true)} />;
}

// Simple markdown renderer for comments (supports code blocks, bold, inline code)
function renderCommentMarkdown(text: string): string {
    return text
        .replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, _lang, code) => `<pre class="bg-slate-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto my-2 font-mono"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-primary">$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>');
}

const PRIORITY_STYLES: Record<string, string> = {
    High: 'bg-red-500 text-white',
    Medium: 'bg-amber-500 text-white',
    Low: 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const STATUS_COLORS: Record<string, string> = {
    'To Do': 'bg-slate-400',
    'In Progress': 'bg-primary',
    Review: 'bg-purple-500',
    Done: 'bg-green-500',
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, currentUser, currentUserId, onUpdateTask }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentInput, setCommentInput] = useState('');
    const [sending, setSending] = useState(false);
    const [editingTags, setEditingTags] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [activeTab, setActiveTab] = useState<'comments' | 'time' | 'ai'>('comments');
    const commentsEndRef = useRef<HTMLDivElement>(null);

    // Time tracking state
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [manualHours, setManualHours] = useState('');
    const [timeNote, setTimeNote] = useState('');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // AI state
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState('');

    useEffect(() => {
        if (isOpen && task?.id) {
            fetchComments();
            fetchTimeLogs();
            const tagsStr = Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || '');
            setTagInput(tagsStr);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isOpen, task?.id]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    // Timer effect
    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [timerRunning]);

    const fetchComments = async () => {
        try {
            const data = await api.getComments(task.id);
            if (Array.isArray(data)) setComments(data);
        } catch (e) { console.error(e); }
    };

    const fetchTimeLogs = async () => {
        try {
            const data = await api.getTimeLogs(task.id);
            if (Array.isArray(data)) setTimeLogs(data);
        } catch { setTimeLogs([]); }
    };

    const handleAddComment = async () => {
        if (!commentInput.trim() || sending) return;
        setSending(true);
        try {
            await api.addComment(task.id, currentUserId || '', currentUser?.name || 'Anonymous', currentUser?.avatar || '', commentInput.trim());
            setCommentInput('');
            await fetchComments();
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    const handleSaveTags = () => {
        const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
        onUpdateTask(task.id, { tags: tags as any });
        setEditingTags(false);
    };

    const handleLogTime = async (hours?: number) => {
        const h = hours || parseFloat(manualHours);
        if (!h || h <= 0) return;
        try {
            await api.addTimeLog(task.id, currentUserId || '', currentUser?.name || 'User', h, timeNote);
            setManualHours('');
            setTimeNote('');
            setTimerSeconds(0);
            setTimerRunning(false);
            await fetchTimeLogs();
        } catch (e) { console.error(e); }
    };

    const handleStopTimer = () => {
        setTimerRunning(false);
        const hours = parseFloat((timerSeconds / 3600).toFixed(2));
        if (hours > 0) handleLogTime(hours);
    };

    const handleAIAssist = async (type: string) => {
        setAiLoading(true);
        setAiResult('');
        try {
            const result = await api.aiAssist(task.title + (task.description ? ': ' + task.description : ''), type);
            setAiResult(result.response || '');
        } catch { setAiResult('Failed to get AI response.'); }
        finally { setAiLoading(false); }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'No due date';
        try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return dateStr; }
    };

    const formatCommentTime = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            const diff = Date.now() - d.getTime();
            if (diff < 60000) return 'Just now';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { return ''; }
    };

    const formatTimer = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const totalHours = timeLogs.reduce((sum, l) => sum + (l.hours || 0), 0);

    if (!isOpen) return null;

    const tags = Array.isArray(task.tags) ? task.tags : (typeof task.tags === 'string' && task.tags ? (task.tags as string).split(',').map(t => t.trim()).filter(Boolean) : []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-surface-dark w-full max-w-4xl max-h-[88vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between shrink-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 mb-1.5">
                            <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Low}`}>{task.priority}</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[task.status] || STATUS_COLORS['To Do']}`}></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.status}</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-black tracking-tight leading-tight">{task.title}</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 shrink-0">
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-8 py-5 space-y-5">
                        {/* Description */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</h4>
                            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: renderCommentMarkdown(task.description || 'No description provided.') }} />
                        </div>

                        {/* Meta row */}
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assignee</p>
                                <div className="flex items-center gap-2">
                                    <Avatar name={task.assignee || 'Unassigned'} avatar={task.assigneeAvatar} size="w-5 h-5" />
                                    <span className="text-xs font-bold truncate">{task.assignee || 'Unassigned'}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                <p className="text-xs font-bold">{formatDate(task.dueDate)}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Comments</p>
                                <p className="text-xs font-bold">{comments.length}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Logged</p>
                                <p className="text-xs font-bold text-primary">{totalHours.toFixed(1)}h</p>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</h4>
                                <button onClick={() => setEditingTags(!editingTags)} className="text-[10px] font-bold text-primary">{editingTags ? 'Cancel' : 'Edit'}</button>
                            </div>
                            {editingTags ? (
                                <div className="flex gap-2">
                                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="bug, feature, urgent"
                                        className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary" />
                                    <button onClick={handleSaveTags} className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl">Save</button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.length > 0 ? tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-primary/10 text-primary uppercase tracking-wider">{tag}</span>
                                    )) : <span className="text-xs text-slate-400">No tags</span>}
                                </div>
                            )}
                        </div>

                        {/* Tab Switcher */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
                                {[
                                    { key: 'comments' as const, icon: 'forum', label: `Discussion (${comments.length})` },
                                    { key: 'time' as const, icon: 'timer', label: 'Time Tracking' },
                                    { key: 'ai' as const, icon: 'smart_toy', label: 'AI Assistant' },
                                ].map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${activeTab === tab.key ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                        <span className="material-icons-outlined text-sm">{tab.icon}</span>{tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Comments Tab */}
                            {activeTab === 'comments' && (
                                <div>
                                    <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar mb-3">
                                        {comments.length === 0 ? (
                                            <div className="text-center py-6">
                                                <span className="material-icons-outlined text-3xl text-slate-300 mb-2 block">forum</span>
                                                <p className="text-xs text-slate-400 font-bold">No comments yet. Start the discussion!</p>
                                            </div>
                                        ) : comments.map(c => (
                                            <div key={c.id} className="flex gap-3">
                                                <Avatar name={c.authorName} avatar={c.authorAvatar} size="w-7 h-7" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-sm font-black">{c.authorName}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold">{formatCommentTime(c.createdAt)}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5"
                                                        dangerouslySetInnerHTML={{ __html: renderCommentMarkdown(c.content) }} />
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={commentsEndRef} />
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <Avatar name={currentUser?.name || 'Me'} avatar={currentUser?.avatar} size="w-7 h-7" />
                                        <div className="flex-1 flex gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-colors">
                                            <input value={commentInput} onChange={e => setCommentInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                                                placeholder="Write a comment... (supports **bold**, `code`, ```code blocks```)" className="flex-1 bg-transparent text-sm outline-none" />
                                            <button onClick={handleAddComment} disabled={!commentInput.trim() || sending}
                                                className="w-7 h-7 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-30 text-white flex items-center justify-center transition-all active:scale-90">
                                                <span className="material-icons-outlined text-sm">send</span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-300 mt-1.5 ml-10">Supports Markdown: **bold**, `inline code`, ```code blocks```</p>
                                </div>
                            )}

                            {/* Time Tracking Tab */}
                            {activeTab === 'time' && (
                                <div className="space-y-4">
                                    {/* Timer */}
                                    <div className="bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/20 rounded-2xl p-5 text-center">
                                        <p className="text-4xl font-black font-mono tracking-widest mb-3">{formatTimer(timerSeconds)}</p>
                                        <div className="flex justify-center gap-2">
                                            {!timerRunning ? (
                                                <button onClick={() => setTimerRunning(true)}
                                                    className="px-5 py-2 bg-primary text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-primary/30 flex items-center gap-1.5">
                                                    <span className="material-icons-outlined text-sm">play_arrow</span>Start Timer
                                                </button>
                                            ) : (
                                                <button onClick={handleStopTimer}
                                                    className="px-5 py-2 bg-red-500 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-1.5">
                                                    <span className="material-icons-outlined text-sm">stop</span>Stop & Log
                                                </button>
                                            )}
                                            {timerSeconds > 0 && !timerRunning && (
                                                <button onClick={() => setTimerSeconds(0)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Reset</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Manual Entry */}
                                    <div className="flex gap-2">
                                        <input type="number" step="0.25" value={manualHours} onChange={e => setManualHours(e.target.value)}
                                            className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-primary" placeholder="Hours" />
                                        <input value={timeNote} onChange={e => setTimeNote(e.target.value)}
                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Note (optional)" />
                                        <button onClick={() => handleLogTime()} disabled={!manualHours || parseFloat(manualHours) <= 0}
                                            className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl disabled:opacity-30">Log</button>
                                    </div>

                                    {/* Time Logs */}
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {timeLogs.map(log => (
                                            <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons-outlined text-primary text-sm">schedule</span>
                                                    <span className="text-sm font-bold">{log.hours}h</span>
                                                    <span className="text-xs text-slate-400">by {log.userName}</span>
                                                    {log.note && <span className="text-xs text-slate-400">— {log.note}</span>}
                                                </div>
                                                <span className="text-[10px] text-slate-400">{formatCommentTime(log.loggedAt)}</span>
                                            </div>
                                        ))}
                                        {timeLogs.length === 0 && <p className="text-center text-xs text-slate-400 py-4">No time logged yet</p>}
                                    </div>
                                </div>
                            )}

                            {/* AI Assistant Tab */}
                            {activeTab === 'ai' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { type: 'describe', icon: 'description', label: 'Generate Description', desc: 'Auto-generate task details' },
                                            { type: 'suggestions', icon: 'lightbulb', label: 'Get Suggestions', desc: 'Implementation advice' },
                                            { type: 'review', icon: 'checklist', label: 'Review Checklist', desc: 'Code review checklist' },
                                        ].map(item => (
                                            <button key={item.type} onClick={() => handleAIAssist(item.type)} disabled={aiLoading}
                                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left hover:bg-primary/5 hover:border-primary/20 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50">
                                                <span className="material-icons-outlined text-primary text-lg mb-1 block">{item.icon}</span>
                                                <p className="text-xs font-black">{item.label}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                                            </button>
                                        ))}
                                    </div>

                                    {aiLoading && (
                                        <div className="text-center py-6">
                                            <span className="material-icons-outlined text-2xl text-primary animate-spin block mb-2">refresh</span>
                                            <p className="text-xs text-slate-400 font-bold">AI is thinking...</p>
                                        </div>
                                    )}

                                    {aiResult && (
                                        <div className="bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/20 rounded-2xl p-5 max-h-60 overflow-y-auto">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="material-icons-outlined text-primary text-sm">smart_toy</span>
                                                <span className="text-xs font-black text-primary uppercase tracking-widest">AI Response</span>
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
                                                dangerouslySetInnerHTML={{ __html: renderCommentMarkdown(aiResult) }} />
                                            <button onClick={() => { setCommentInput(aiResult); setActiveTab('comments'); }}
                                                className="mt-3 text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                                <span className="material-icons-outlined text-sm">content_copy</span>Copy to Comment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
