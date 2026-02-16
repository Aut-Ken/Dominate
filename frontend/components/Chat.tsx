import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, TeamMember } from '../types';
import { api } from '../services/api';

interface ChatProps {
    currentUser?: TeamMember;
    currentUserId: string | null;
    team: TeamMember[];
}

const CHANNELS = [
    { id: 'general', name: 'General', icon: 'tag', desc: 'Team-wide discussions' },
    { id: 'random', name: 'Random', icon: 'casino', desc: 'Off-topic fun' },
    { id: 'help', name: 'Help', icon: 'help', desc: 'Ask for assistance' },
    { id: 'announcements', name: 'Announcements', icon: 'campaign', desc: 'Important updates' },
];

const EMOJI_LIST = ['😀', '😂', '🥰', '😎', '🤔', '👍', '👋', '🎉', '🔥', '❤️', '💯', '🙏', '😢', '😡', '🤝', '✅', '⭐', '🚀', '💪', '👏'];

const API_HOST = 'http://localhost:8080';

function Avatar({ name, avatar, size = 'w-9 h-9' }: { name: string; avatar?: string; size?: string }) {
    const [failed, setFailed] = useState(false);
    const initial = (name || 'U')[0]?.toUpperCase();
    if (!avatar || failed) {
        return (
            <div className={`${size} rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0`}>
                {initial}
            </div>
        );
    }
    return <img src={avatar} alt={name} className={`${size} rounded-full object-cover shrink-0`} onError={() => setFailed(true)} />;
}

function formatTime(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        if (isToday) return time;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
    } catch { return ''; }
}

function dmChannelId(uid1: string, uid2: string): string {
    const sorted = [uid1, uid2].sort();
    return `dm_${sorted[0]}_${sorted[1]}`;
}

const Chat: React.FC<ChatProps> = ({ currentUser, currentUserId, team }) => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [activeDm, setActiveDm] = useState<TeamMember | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);

    const currentChannel = activeDm
        ? dmChannelId(currentUserId || '', activeDm.userId || activeDm.id)
        : activeChannel;

    const fetchMessages = async () => {
        try {
            const data = await api.getMessages(currentChannel);
            if (Array.isArray(data)) setMessages(data);
        } catch (err) { console.error('Failed to fetch messages:', err); }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [currentChannel]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close emoji picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSend = async (content?: string, msgType = 'text', fileName = '') => {
        const text = content || input.trim();
        if (!text || sending) return;
        setSending(true);
        try {
            await api.sendMessage(
                currentUserId || '', currentUser?.name || 'Anonymous',
                currentUser?.avatar || '', text, currentChannel, msgType, fileName
            );
            if (!content) setInput('');
            setShowEmoji(false);
            await fetchMessages();
            inputRef.current?.focus();
        } catch (err) { console.error('Failed to send:', err); }
        finally { setSending(false); }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const result = await api.uploadFile(file);
            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name);
            await handleSend(result.url, isImage ? 'image' : 'file', result.fileName);
        } catch (err) { console.error('Upload failed:', err); }
        finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const selectChannel = (id: string) => { setActiveChannel(id); setActiveDm(null); };
    const selectDm = (member: TeamMember) => { setActiveDm(member); setActiveChannel(''); };

    const channelInfo = CHANNELS.find(c => c.id === activeChannel);
    const headerTitle = activeDm ? activeDm.name : `#${channelInfo?.name || activeChannel}`;
    const headerDesc = activeDm ? 'Direct Message' : (channelInfo?.desc || '');
    const headerIcon = activeDm ? 'person' : (channelInfo?.icon || 'tag');

    const dmMembers = team.filter(m => (m.userId || m.id) !== currentUserId);

    return (
        <div className="flex h-full animate-in fade-in duration-500">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
                {/* Channels */}
                <div className="p-5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Channels</h2>
                    <div className="space-y-0.5">
                        {CHANNELS.map(ch => (
                            <button key={ch.id} onClick={() => selectChannel(ch.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all text-sm ${!activeDm && activeChannel === ch.id
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}>
                                <span className="material-icons-outlined text-base">{ch.icon}</span>
                                <span className="font-bold truncate">{ch.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Direct Messages */}
                <div className="flex-1 p-5 pt-4 overflow-y-auto custom-scrollbar">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Direct Messages</h2>
                    <div className="space-y-0.5">
                        {dmMembers.map(member => {
                            const memberId = member.userId || member.id;
                            const isActive = activeDm && (activeDm.userId || activeDm.id) === memberId;
                            return (
                                <button key={memberId} onClick={() => selectDm(member)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${isActive
                                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }`}>
                                    <Avatar name={member.name} avatar={member.avatar} size="w-7 h-7" />
                                    <span className="text-sm font-bold truncate">{member.name}</span>
                                    <span className={`w-2 h-2 rounded-full ml-auto shrink-0 ${isActive ? 'bg-white/60' : 'bg-emerald-500'}`}></span>
                                </button>
                            );
                        })}
                        {dmMembers.length === 0 && (
                            <p className="text-xs text-slate-400 font-medium px-2 py-4">No team members yet</p>
                        )}
                    </div>
                </div>

                {/* Current user */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Avatar name={currentUser?.name || 'Me'} avatar={currentUser?.avatar} size="w-7 h-7" />
                        <span className="text-xs font-bold text-slate-500 truncate">{currentUser?.name || 'Guest'}</span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full ml-auto shrink-0"></span>
                    </div>
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-2.5">
                        {activeDm ? <Avatar name={activeDm.name} avatar={activeDm.avatar} size="w-8 h-8" /> :
                            <span className="material-icons-outlined text-primary text-xl">{headerIcon}</span>}
                        <div>
                            <h3 className="text-sm font-black">{headerTitle}</h3>
                            <p className="text-[9px] text-slate-400 font-medium">{headerDesc}</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{messages.length} messages</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <span className="material-icons-outlined text-3xl text-primary">{activeDm ? 'chat' : 'chat_bubble_outline'}</span>
                            </div>
                            <h3 className="text-lg font-black mb-1">No messages yet</h3>
                            <p className="text-sm text-slate-400 font-medium">
                                {activeDm ? `Start a conversation with ${activeDm.name}!` : `Be the first to post in ${headerTitle}!`}
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUserId;
                                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                const showTime = !prevMsg || prevMsg.senderId !== msg.senderId ||
                                    (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 300000);
                                const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                                return (
                                    <div key={msg.id} className={`${showTime ? 'mt-4' : 'mt-1'}`}>
                                        {/* Time divider */}
                                        {showTime && (
                                            <div className={`flex items-center gap-2 mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                {!isMe && showAvatar && <div className="w-8"></div>}
                                                <span className="text-[9px] text-slate-400 font-bold">{isMe ? '' : msg.senderName + '  '}{formatTime(msg.createdAt)}</span>
                                            </div>
                                        )}
                                        {/* Message bubble */}
                                        <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* Avatar */}
                                            {!isMe && showAvatar ? (
                                                <Avatar name={msg.senderName} avatar={msg.senderAvatar} size="w-8 h-8" />
                                            ) : !isMe ? <div className="w-8 shrink-0"></div> : null}

                                            {/* Bubble */}
                                            <div className={`max-w-[65%] ${isMe
                                                ? 'bg-primary text-white rounded-2xl rounded-br-md'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-md'
                                                } shadow-sm`}>
                                                {msg.msgType === 'image' ? (
                                                    <a href={`${API_HOST}${msg.content}`} target="_blank" rel="noreferrer" className="block">
                                                        <img src={`${API_HOST}${msg.content}`} alt={msg.fileName || 'image'}
                                                            className="max-w-[280px] max-h-[200px] rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                                    </a>
                                                ) : msg.msgType === 'file' ? (
                                                    <a href={`${API_HOST}${msg.content}`} target="_blank" rel="noreferrer"
                                                        className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'hover:bg-white/10' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'} rounded-2xl transition-colors`}>
                                                        <span className="material-icons-outlined text-2xl">description</span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold truncate">{msg.fileName || 'File'}</p>
                                                            <p className={`text-[9px] font-medium ${isMe ? 'text-white/60' : 'text-slate-400'}`}>Click to download</p>
                                                        </div>
                                                        <span className="material-icons-outlined text-lg ml-2">download</span>
                                                    </a>
                                                ) : (
                                                    <p className="px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input area */}
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-2xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        {/* Emoji button */}
                        <div className="relative" ref={emojiRef}>
                            <button onClick={() => setShowEmoji(!showEmoji)}
                                className="w-9 h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-icons-outlined text-xl">mood</span>
                            </button>
                            {showEmoji && (
                                <div className="absolute bottom-12 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 grid grid-cols-5 gap-1 w-56 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {EMOJI_LIST.map(emoji => (
                                        <button key={emoji} onClick={() => setInput(prev => prev + emoji)}
                                            className="text-xl w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors active:scale-90">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* File upload */}
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            className="w-9 h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-40">
                            <span className="material-icons-outlined text-xl">{uploading ? 'hourglass_empty' : 'attach_file'}</span>
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />

                        {/* Text input */}
                        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown} placeholder={`Message ${headerTitle}...`}
                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400" />

                        {/* Send */}
                        <button onClick={() => handleSend()} disabled={!input.trim() || sending}
                            className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-primary/30">
                            <span className="material-icons-outlined text-lg">{sending ? 'hourglass_empty' : 'send'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
