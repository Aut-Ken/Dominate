import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';
import { api } from '../services/api';

interface AIChatPanelProps {
    projects: Project[];
    currentUserName: string;
}

interface ChatMsg {
    role: 'user' | 'assistant';
    content: string;
}

// Simple markdown renderer for AI messages
function renderAIMarkdown(text: string): string {
    return text
        .replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, _lang, code) =>
            `<pre class="bg-slate-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto my-2 font-mono border border-slate-700"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
        .replace(/`([^`]+)`/g, '<code class="bg-slate-700 px-1 py-0.5 rounded text-xs font-mono text-emerald-300">$1</code>')
        .replace(/^### (.+)$/gm, '<h3 class="text-sm font-black mt-3 mb-1">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-sm font-black mt-4 mb-1.5 pb-1 border-b border-white/10">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-base font-black mt-4 mb-2">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-1.5 my-0.5"><span class="text-green-400 text-xs">✅</span><span class="line-through opacity-50 text-xs">$1</span></div>')
        .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-1.5 my-0.5"><span class="text-slate-400 text-xs">⬜</span><span class="text-xs">$1</span></div>')
        .replace(/^- (.+)$/gm, '<div class="flex items-start gap-1.5 my-0.5"><span class="text-primary mt-0.5">•</span><span class="text-xs">$1</span></div>')
        .replace(/^\d+\. (.+)$/gm, '<div class="text-xs my-0.5 ml-2">$1</div>')
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/50 pl-3 my-2 text-xs italic opacity-80">$1</blockquote>')
        .replace(/\n\n/g, '</p><p class="my-1.5">')
        .replace(/\n/g, '<br/>');
}

const QUICK_ACTIONS = [
    { icon: 'trending_up', label: '项目进度', prompt: '请分析当前所有项目的整体进度情况，包括完成率、瓶颈和建议' },
    { icon: 'warning', label: '风险预警', prompt: '请识别当前项目中的风险因素，包括即将到期的任务、延期风险、工作量不均等问题' },
    { icon: 'summarize', label: '每日汇报', prompt: '请生成今日的项目汇报摘要，包括各项目状态、待办事项和优先事项' },
    { icon: 'tips_and_updates', label: '优化建议', prompt: '请分析当前项目管理流程，给出效率优化建议和最佳实践' },
];

const AIChatPanel: React.FC<AIChatPanelProps> = ({ projects, currentUserName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiConfigured, setAiConfigured] = useState(false);
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        checkAIStatus();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const checkAIStatus = async () => {
        try {
            const status = await api.getAIStatus();
            setAiConfigured(status.configured);
        } catch { /* ignore */ }
    };

    const handleSaveKey = async () => {
        if (!apiKey.trim()) return;
        try {
            const result = await api.setAIKey(apiKey.trim());
            setAiConfigured(result.configured);
            setShowKeyInput(false);
            setApiKey('');
            if (result.configured) {
                setMessages([{ role: 'assistant', content: '🎉 API Key 配置成功！我是 **Dominate AI 助手**，由 MiniMax M2.5 驱动。\n\n我可以帮你：\n- 📊 分析项目进度\n- ⚠️ 风险预警\n- 📝 生成汇报\n- 💡 优化建议\n\n试试下方的快捷操作，或直接问我任何问题！' }]);
            }
        } catch { /* ignore */ }
    };

    const handleSend = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput('');

        const newUserMsg: ChatMsg = { role: 'user', content: msg };
        const updatedMessages = [...messages, newUserMsg];
        setMessages(updatedMessages);
        setLoading(true);

        try {
            const result = await api.aiChat(
                updatedMessages.map(m => ({ role: m.role, content: m.content })),
                selectedProject || undefined

            );
            setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ 请求失败，请检查网络连接或 API Key 配置' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-slate-700 rotate-180' : 'bg-gradient-to-br from-primary to-indigo-600 shadow-primary/40'}`}>
                <span className="material-icons-outlined text-white text-2xl">{isOpen ? 'close' : 'smart_toy'}</span>
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[420px] h-[600px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/20 to-indigo-500/20 px-5 py-4 border-b border-slate-700/50 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                                    <span className="material-icons-outlined text-white text-lg">smart_toy</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">Dominate AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${aiConfigured ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                                        <span className="text-[9px] text-slate-400 font-bold">{aiConfigured ? 'MiniMax M2.5' : '未配置'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setShowKeyInput(!showKeyInput)}
                                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400">
                                    <span className="material-icons-outlined text-sm">settings</span>
                                </button>
                                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                                    className="bg-transparent border border-slate-600 rounded-lg px-2 py-1 text-[10px] text-slate-300 outline-none max-w-[120px]">
                                    <option value="">全部项目</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* API Key Input */}
                        {showKeyInput && (
                            <div className="mt-3 flex gap-2">
                                <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password"
                                    placeholder="输入 MiniMax API Key..." className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-primary placeholder:text-slate-500" />
                                <button onClick={handleSaveKey} className="px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg">保存</button>
                            </div>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center pt-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons-outlined text-primary text-3xl">psychology</span>
                                </div>
                                <h3 className="text-base font-black text-white mb-1">你好, {currentUserName}!</h3>
                                <p className="text-xs text-slate-400 mb-6">我是你的 AI 项目管理助手</p>
                                <div className="grid grid-cols-2 gap-2 px-2">
                                    {QUICK_ACTIONS.map(action => (
                                        <button key={action.label} onClick={() => handleSend(action.prompt)}
                                            className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-left hover:bg-primary/10 hover:border-primary/30 transition-all group">
                                            <span className="material-icons-outlined text-primary text-base mb-1 block group-hover:scale-110 transition-transform">{action.icon}</span>
                                            <p className="text-[11px] font-bold text-white">{action.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-6 h-6 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center mr-2 shrink-0 mt-0.5">
                                            <span className="material-icons-outlined text-white text-xs">smart_toy</span>
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700/50'}`}>
                                        {msg.role === 'user' ? (
                                            <p className="text-xs leading-relaxed">{msg.content}</p>
                                        ) : (
                                            <div className="text-xs leading-relaxed ai-response" dangerouslySetInnerHTML={{ __html: renderAIMarkdown(msg.content) }} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="material-icons-outlined text-white text-xs animate-pulse">smart_toy</span>
                                </div>
                                <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700/50">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-slate-700/50 shrink-0 bg-slate-900/80">
                        <div className="flex gap-2 items-center bg-slate-800 rounded-xl px-3 py-1 border border-slate-700 focus-within:border-primary transition-colors">
                            <input value={input} onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                placeholder={aiConfigured ? '问我任何关于项目的问题...' : '请先配置 API Key ⚙️'}
                                disabled={!aiConfigured}
                                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500 py-2 disabled:opacity-50" />
                            <button onClick={() => handleSend()} disabled={!input.trim() || loading || !aiConfigured}
                                className="w-7 h-7 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-30 text-white flex items-center justify-center transition-all active:scale-90">
                                <span className="material-icons-outlined text-sm">send</span>
                            </button>
                        </div>
                        <p className="text-[8px] text-slate-600 text-center mt-1">Powered by MiniMax M2.5 — 项目数据实时同步</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatPanel;
