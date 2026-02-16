import React, { useState, useEffect } from 'react';
import { Project, Task, Sprint } from '../types';
import { api } from '../services/api';

interface SprintsProps {
    projects: Project[];
    tasks: Task[];
    currentUserId: string;
}

const Sprints: React.FC<SprintsProps> = ({ projects, tasks, currentUserId }) => {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

    useEffect(() => {
        loadSprints();
    }, [selectedProject]);

    const loadSprints = async () => {
        try {
            const data = await api.getSprints(selectedProject || undefined);
            setSprints(Array.isArray(data) ? data : []);
        } catch { setSprints([]); }
    };

    const handleCreate = async () => {
        if (!form.name || !form.startDate || !form.endDate || !selectedProject) return;
        try {
            const sprint = await api.createSprint(selectedProject, form.name, form.goal, form.startDate, form.endDate);
            setSprints(prev => [sprint, ...prev]);
            setCreating(false);
            setForm({ name: '', goal: '', startDate: '', endDate: '' });
        } catch (e) { console.error(e); }
    };

    const handleStatusChange = async (sprint: Sprint, status: string) => {
        try {
            const updated = await api.updateSprint(sprint.id, { status });
            setSprints(prev => prev.map(s => s.id === sprint.id ? updated : s));
            if (selectedSprint?.id === sprint.id) setSelectedSprint(updated);
        } catch (e) { console.error(e); }
    };

    const getStatusColor = (status: string) => {
        if (status === 'Active') return 'bg-green-500';
        if (status === 'Completed') return 'bg-slate-400';
        return 'bg-amber-500';
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const projectTasks = tasks.filter(t => t.projectId === selectedProject);
    const sprintTaskStats = (sprintId: string) => {
        const sTasks = projectTasks.filter(t => t.sprintId === sprintId);
        return {
            total: sTasks.length || projectTasks.length,
            done: sTasks.length ? sTasks.filter(t => t.status === 'Done').length : projectTasks.filter(t => t.status === 'Done').length,
            inProgress: sTasks.length ? sTasks.filter(t => t.status === 'In Progress').length : projectTasks.filter(t => t.status === 'In Progress').length,
        };
    };

    return (
        <div className="p-8 max-w-6xl mx-auto pb-32 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center"><span className="material-icons-outlined text-indigo-500">sprint</span></span>
                        Sprint Management
                    </h1>
                    <p className="text-sm text-slate-400 font-bold mt-1">Plan and track iteration cycles</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none">
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={() => setCreating(true)}
                        className="px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center gap-2">
                        <span className="material-icons-outlined text-sm">add</span>New Sprint
                    </button>
                </div>
            </div>

            {/* Create Sprint Modal */}
            {creating && (
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-3xl p-8 mb-8 shadow-xl">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2"><span className="material-icons-outlined text-primary">add_circle</span>Create Sprint</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Sprint Name</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Sprint 1" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Goal</label>
                            <input value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="Complete user authentication" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Start Date</label>
                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">End Date</label>
                            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setCreating(false)} className="px-5 py-2.5 text-xs font-bold text-slate-400">Cancel</button>
                        <button onClick={handleCreate} className="px-6 py-2.5 bg-primary text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-primary/30">Create Sprint</button>
                    </div>
                </div>
            )}

            {/* Sprint Cards */}
            <div className="space-y-4">
                {sprints.map(sprint => {
                    const stats = sprintTaskStats(sprint.id);
                    const daysLeft = getDaysRemaining(sprint.endDate);
                    const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

                    return (
                        <div key={sprint.id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(sprint.status)}`}></div>
                                    <div>
                                        <h3 className="text-lg font-black">{sprint.name}</h3>
                                        <p className="text-xs text-slate-400 font-bold">{sprint.goal}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select value={sprint.status} onChange={e => handleStatusChange(sprint, e.target.value)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-none outline-none cursor-pointer ${sprint.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : sprint.status === 'Completed' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        <option value="Planning">Planning</option>
                                        <option value="Active">Active</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center">
                                    <p className="text-lg font-black">{stats.total}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Tasks</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center">
                                    <p className="text-lg font-black text-green-500">{stats.done}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Done</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center">
                                    <p className="text-lg font-black text-primary">{stats.inProgress}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Active</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center">
                                    <p className={`text-lg font-black ${daysLeft < 3 ? 'text-red-500' : daysLeft < 7 ? 'text-amber-500' : ''}`}>{daysLeft > 0 ? daysLeft : 0}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Days Left</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center">
                                    <p className="text-lg font-black text-purple-500">{progress}%</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Progress</p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between mt-3 text-xs text-slate-400 font-bold">
                                <span>{sprint.startDate} → {sprint.endDate}</span>
                            </div>
                        </div>
                    );
                })}

                {sprints.length === 0 && (
                    <div className="text-center py-20">
                        <span className="material-icons-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4 block">sprint</span>
                        <h3 className="text-xl font-black text-slate-300 dark:text-slate-600">No sprints yet</h3>
                        <p className="text-sm text-slate-400 mt-2">Create your first sprint to start tracking iterations</p>
                        <button onClick={() => setCreating(true)} className="mt-4 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30">
                            Create First Sprint
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sprints;
