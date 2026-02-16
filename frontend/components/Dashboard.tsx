
import React from 'react';
import { Project, Task, TeamMember } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  team: TeamMember[];
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_COLORS = ['#2badee', '#2badee', '#8b5cf6', '#2badee', '#2badee', '#94a3b8', '#94a3b8'];

function generateWeeklyData(tasks: Task[]) {
  const dayCounts = DAY_NAMES.map(() => 0);
  tasks.forEach(task => {
    if (!task.dueDate) return;
    try {
      const date = new Date(task.dueDate);
      if (isNaN(date.getTime())) return;
      const dayIdx = (date.getDay() + 6) % 7;
      dayCounts[dayIdx] += 1;
    } catch { /* skip */ }
  });
  return DAY_NAMES.map((name, i) => ({ name, value: dayCounts[i], color: DAY_COLORS[i] }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in duration-300">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">{label}</p>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black text-white">{payload[0].value}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Activities<br />Resolved</span>
        </div>
      </div>
    );
  }
  return null;
};

// Map stat card icon background colors explicitly (Tailwind can't compose dynamic class names)
const ICON_BG: Record<string, string> = {
  'bg-blue-500': 'bg-blue-500/10',
  'bg-purple-500': 'bg-purple-500/10',
  'bg-orange-500': 'bg-orange-500/10',
  'bg-emerald-500': 'bg-emerald-500/10',
};

const Dashboard: React.FC<DashboardProps> = ({ tasks, projects, team }) => {
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length || 1;
  const efficiency = Math.round((completedTasks / totalTasks) * 100);

  const chartData = generateWeeklyData(tasks);

  const recentTasks = tasks
    .filter(t => t.status === 'Done')
    .slice(0, 5);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: 'folder_special', color: 'text-blue-500', bg: 'bg-blue-500' },
    { label: 'Pending Tasks', value: pendingTasks, icon: 'task', color: 'text-purple-500', bg: 'bg-purple-500' },
    { label: 'Efficiency Rate', value: `${efficiency}%`, icon: 'speed', color: 'text-orange-500', bg: 'bg-orange-500' },
    { label: 'Team Members', value: team.length, icon: 'group', color: 'text-emerald-500', bg: 'bg-emerald-500' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-[1.5rem] ${ICON_BG[stat.bg] || 'bg-slate-100 dark:bg-slate-800'}`}>
                <span className={`material-icons-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
              </div>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
            <p className="text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-black">Weekly Momentum</h2>
            <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 shadow-sm">
              Current Period <span className="material-icons-outlined text-sm">expand_more</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[14, 14, 14, 14]} barSize={45} animationDuration={1200} animationEasing="ease-out">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-[500px]">
          <div className="w-full mb-8">
            <h2 className="text-2xl font-black">Productivity Index</h2>
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="w-56 h-56 transform -rotate-90">
              <circle cx="112" cy="112" r="90" fill="none" stroke="currentColor" strokeWidth="20" className="text-slate-100 dark:text-slate-800/40" />
              <circle
                cx="112" cy="112" r="90" fill="none" stroke="#2badee" strokeWidth="20"
                strokeDasharray={565} strokeDashoffset={565 * (1 - efficiency / 100)}
                strokeLinecap="round" className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{efficiency}%</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Goal Reached</span>
            </div>
          </div>
          <div className="w-full mt-8 grid grid-cols-2 gap-4 px-2">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Efforts</p>
              <p className="text-xl font-black text-primary">{pendingTasks}</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolved</p>
              <p className="text-xl font-black text-emerald-500">{completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-surface-dark p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black">Recent Activity</h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completedTasks} Completed</span>
        </div>
        {recentTasks.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-icons-outlined text-4xl text-slate-200 dark:text-slate-700 mb-3 block">history</span>
            <p className="text-sm text-slate-400 font-bold">No completed tasks yet. Keep going!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task, idx) => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <span className="material-icons-outlined text-emerald-500 text-lg">check_circle</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{task.priority} Priority</p>
                </div>
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full">Done</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
