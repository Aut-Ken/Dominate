import React, { useState, useEffect } from 'react';
import { Project, WikiPage } from '../types';
import { api } from '../services/api';

interface WikiProps {
    projects: Project[];
    currentUserId: string;
    currentUserName: string;
}

// Simple Markdown renderer
function renderMarkdown(text: string): string {
    let html = text
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => `<pre class="bg-slate-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto my-4 border border-slate-700"><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-primary">$1</code>')
        // Headers
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-black mt-6 mb-2">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-black mt-8 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black mt-8 mb-4">$1</h1>')
        // Bold and Italic
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-black">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Checkboxes
        .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><span class="material-icons-outlined text-green-500 text-sm">check_box</span><span class="line-through opacity-50">$1</span></div>')
        .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 my-1"><span class="material-icons-outlined text-slate-400 text-sm">check_box_outline_blank</span><span>$1</span></div>')
        // Lists
        .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc my-0.5">$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal my-0.5">$1</li>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-1 my-3 bg-primary/5 rounded-r-xl italic">$1</blockquote>')
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr class="my-6 border-slate-200 dark:border-slate-700"/>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p class="my-2">')
        // Line breaks
        .replace(/\n/g, '<br/>');
    return `<p class="my-2">${html}</p>`;
}

const Wiki: React.FC<WikiProps> = ({ projects, currentUserId, currentUserName }) => {
    const [pages, setPages] = useState<WikiPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
    const [editing, setEditing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPages();
    }, [selectedProject]);

    const loadPages = async () => {
        try {
            const data = await api.getWikiPages(selectedProject || undefined);
            setPages(Array.isArray(data) ? data : []);
        } catch { setPages([]); }
    };

    const handleCreate = async () => {
        if (!title.trim()) return;
        try {
            const page = await api.createWikiPage(selectedProject, title, content, currentUserId, currentUserName);
            setPages(prev => [page, ...prev]);
            setSelectedPage(page);
            setCreating(false);
            setTitle('');
            setContent('');
        } catch (e) { console.error(e); }
    };

    const handleUpdate = async () => {
        if (!selectedPage) return;
        try {
            const updated = await api.updateWikiPage(selectedPage.id, { title, content });
            setPages(prev => prev.map(p => p.id === selectedPage.id ? updated : p));
            setSelectedPage(updated);
            setEditing(false);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteWikiPage(id);
            setPages(prev => prev.filter(p => p.id !== id));
            if (selectedPage?.id === id) setSelectedPage(null);
        } catch (e) { console.error(e); }
    };

    const filteredPages = pages.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-full animate-in fade-in duration-500">
            {/* Sidebar - Page List */}
            <div className="w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white/50 dark:bg-surface-dark/50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <span className="material-icons-outlined text-primary">menu_book</span>Wiki
                        </h2>
                        <button onClick={() => { setCreating(true); setEditing(false); setSelectedPage(null); setTitle(''); setContent('# New Page\n\nStart writing...'); }}
                            className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
                            <span className="material-icons-outlined text-sm">add</span>
                        </button>
                    </div>
                    <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none mb-2">
                        <option value="">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm">search</span>
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs font-bold outline-none" placeholder="Search pages..." />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredPages.map(page => (
                        <button key={page.id} onClick={() => { setSelectedPage(page); setCreating(false); setEditing(false); }}
                            className={`w-full text-left p-3 rounded-xl transition-colors ${selectedPage?.id === page.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <p className="text-sm font-bold truncate">{page.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">by {page.authorName} • {new Date(page.updatedAt).toLocaleDateString()}</p>
                        </button>
                    ))}
                    {filteredPages.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <span className="material-icons-outlined text-3xl mb-2 block">article</span>
                            <p className="text-xs font-bold">No pages yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {creating ? (
                    <div className="p-8 max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black">Create New Page</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setCreating(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                                <button onClick={handleCreate} className="px-5 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-transform">Publish</button>
                            </div>
                        </div>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Page Title"
                            className="w-full text-3xl font-black bg-transparent border-none outline-none mb-6 placeholder:text-slate-300" />
                        <div className="grid grid-cols-2 gap-4 min-h-[500px]">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Markdown</p>
                                <textarea value={content} onChange={e => setContent(e.target.value)}
                                    className="w-full h-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-mono text-sm resize-none outline-none focus:border-primary min-h-[500px]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl p-6 min-h-[500px] prose dark:prose-invert max-w-none text-sm"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
                            </div>
                        </div>
                    </div>
                ) : selectedPage ? (
                    <div className="p-8 max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            {editing ? (
                                <input value={title} onChange={e => setTitle(e.target.value)} className="text-3xl font-black bg-transparent border-none outline-none flex-1" />
                            ) : (
                                <h1 className="text-3xl font-black">{selectedPage.title}</h1>
                            )}
                            <div className="flex gap-2">
                                {editing ? (
                                    <>
                                        <button onClick={() => setEditing(false)} className="px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                                        <button onClick={handleUpdate} className="px-5 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl">Save</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setEditing(true); setTitle(selectedPage.title); setContent(selectedPage.content); }}
                                            className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 rounded-xl flex items-center gap-1 hover:bg-primary hover:text-white transition-colors">
                                            <span className="material-icons-outlined text-sm">edit</span>Edit
                                        </button>
                                        <button onClick={() => handleDelete(selectedPage.id)}
                                            className="px-4 py-2 text-xs font-bold text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-1 hover:bg-red-500 hover:text-white transition-colors">
                                            <span className="material-icons-outlined text-sm">delete</span>Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mb-8 text-xs text-slate-400 font-bold">
                            <span>By {selectedPage.authorName}</span>
                            <span>•</span>
                            <span>Updated {new Date(selectedPage.updatedAt).toLocaleString()}</span>
                        </div>
                        {editing ? (
                            <div className="grid grid-cols-2 gap-4">
                                <textarea value={content} onChange={e => setContent(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 font-mono text-sm resize-none outline-none focus:border-primary min-h-[500px]" />
                                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl p-6 min-h-[500px] prose dark:prose-invert max-w-none text-sm"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-3xl p-8 prose dark:prose-invert max-w-none text-sm"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPage.content) }} />
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-center">
                        <div>
                            <span className="material-icons-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4 block">menu_book</span>
                            <h3 className="text-xl font-black text-slate-300 dark:text-slate-600">Select a page or create a new one</h3>
                            <p className="text-sm text-slate-400 mt-2">Write documentation in Markdown with live preview</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wiki;
