import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { api } from '../services/api';

interface GanttChartProps {
    projects: Project[];
}

interface GanttTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    assignee: string;
    startDate: string;
    dueDate: string;
    progress: number;
}

const STATUS_COLORS: Record<string, string> = {
    'To Do': '#64748b',
    'In Progress': '#2badee',
    'Review': '#8b5cf6',
    'Done': '#22c55e',
};

const PRIORITY_ICONS: Record<string, string> = {
    'High': '🔴',
    'Medium': '🟡',
    'Low': '🟢',
};

const GanttChart: React.FC<GanttChartProps> = ({ projects }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [tasks, setTasks] = useState<GanttTask[]>([]);
    const [deps, setDeps] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewDays, setViewDays] = useState(30);

    useEffect(() => {
        if (selectedProjectId) {
            loadGanttData();
        }
    }, [selectedProjectId]);

    const loadGanttData = async () => {
        setLoading(true);
        try {
            const data = await api.getGanttData(selectedProjectId);
            setTasks(data.tasks || []);
            setDeps(data.dependencies || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    // Calculate date range
    const today = new Date();
    const startRange = new Date(today);
    startRange.setDate(startRange.getDate() - 7);
    const endRange = new Date(today);
    endRange.setDate(endRange.getDate() + viewDays);

    const totalDays = Math.ceil((endRange.getTime() - startRange.getTime()) / (1000 * 60 * 60 * 24));
    const dayWidth = 36;

    const getBarPosition = (startDate: string, dueDate: string) => {
        const start = new Date(startDate);
        const end = new Date(dueDate);
        const leftDays = Math.max(0, (start.getTime() - startRange.getTime()) / (1000 * 60 * 60 * 24));
        const widthDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return {
            left: leftDays * dayWidth,
            width: Math.max(widthDays * dayWidth, dayWidth),
        };
    };

    const getDayLabels = () => {
        const labels = [];
        for (let i = 0; i < totalDays; i++) {
            const d = new Date(startRange);
            d.setDate(d.getDate() + i);
            labels.push(d);
        }
        return labels;
    };

    const isToday = (d: Date) => {
        const now = new Date();
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    };

    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

    const dayLabels = getDayLabels();

    return (
        <div className="p-8 max-w-full mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Gantt Chart</h2>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Project Timeline & Dependencies</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="px-4 py-2.5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select Project</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        {[14, 30, 60].map(d => (
                            <button
                                key={d}
                                onClick={() => setViewDays(d)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${viewDays === d ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {d}D
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {!selectedProjectId ? (
                <div className="bg-white dark:bg-surface-dark rounded-[3rem] border border-slate-200 dark:border-slate-800 p-20 text-center">
                    <span className="material-icons-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4 block">timeline</span>
                    <p className="text-slate-400 font-bold">Select a project to view the Gantt chart</p>
                </div>
            ) : loading ? (
                <div className="bg-white dark:bg-surface-dark rounded-[3rem] border border-slate-200 dark:border-slate-800 p-20 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Loading timeline...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white dark:bg-surface-dark rounded-[3rem] border border-slate-200 dark:border-slate-800 p-20 text-center">
                    <span className="material-icons-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4 block">event_busy</span>
                    <p className="text-slate-400 font-bold">No tasks in this project yet</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-surface-dark rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex">
                        {/* Task List (Left Panel) */}
                        <div className="w-[320px] shrink-0 border-r border-slate-200 dark:border-slate-800">
                            <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task ({tasks.length})</span>
                            </div>
                            {tasks.map((task, idx) => (
                                <div key={task.id} className="h-14 border-b border-slate-100 dark:border-slate-800/50 px-6 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors" style={{ animationDelay: `${idx * 30}ms` }}>
                                    <span className="text-xs">{PRIORITY_ICONS[task.priority] || '⚪'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate">{task.title}</p>
                                        <p className="text-[9px] text-slate-400 font-bold">{task.assignee || 'Unassigned'}</p>
                                    </div>
                                    <div className="w-12 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${task.progress}%`, backgroundColor: STATUS_COLORS[task.status] || '#64748b' }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Timeline (Right Panel) */}
                        <div className="flex-1 overflow-x-auto custom-scrollbar">
                            {/* Day Headers */}
                            <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex">
                                {dayLabels.map((d, i) => (
                                    <div
                                        key={i}
                                        className={`shrink-0 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800/30 ${isToday(d) ? 'bg-primary/10' : isWeekend(d) ? 'bg-slate-50 dark:bg-slate-800/20' : ''}`}
                                        style={{ width: dayWidth }}
                                    >
                                        <span className={`text-[8px] font-black uppercase ${isToday(d) ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}>
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
                                        </span>
                                        <span className={`text-[10px] font-black ${isToday(d) ? 'text-primary' : 'text-slate-400'}`}>
                                            {d.getDate()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Task Bars */}
                            {tasks.map((task) => {
                                const pos = getBarPosition(task.startDate, task.dueDate);
                                return (
                                    <div key={task.id} className="h-14 border-b border-slate-100 dark:border-slate-800/50 relative" style={{ width: totalDays * dayWidth }}>
                                        {/* Today marker */}
                                        {dayLabels.map((d, i) => isToday(d) ? (
                                            <div key={`today-${i}`} className="absolute top-0 bottom-0 w-px bg-primary/30" style={{ left: i * dayWidth + dayWidth / 2 }} />
                                        ) : null)}

                                        {/* Task Bar */}
                                        <div
                                            className="absolute top-3 h-8 rounded-lg shadow-sm flex items-center px-2 gap-1 cursor-pointer group transition-all hover:shadow-md hover:scale-[1.02]"
                                            style={{
                                                left: pos.left,
                                                width: pos.width,
                                                backgroundColor: STATUS_COLORS[task.status] || '#64748b',
                                            }}
                                            title={`${task.title} (${task.status}) ${task.progress}%`}
                                        >
                                            {/* Progress overlay */}
                                            <div
                                                className="absolute inset-0 rounded-lg opacity-30"
                                                style={{ width: `${task.progress}%`, backgroundColor: 'rgba(255,255,255,0.3)' }}
                                            />
                                            <span className="text-[9px] font-black text-white truncate relative z-10">{task.title}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-6">
                        {Object.entries(STATUS_COLORS).map(([status, color]) => (
                            <div key={status} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{status}</span>
                            </div>
                        ))}
                        <div className="flex-1" />
                        <span className="text-[9px] font-bold text-slate-300">Dependencies: {deps.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GanttChart;
