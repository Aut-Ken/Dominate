
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

// Generate weekly chart data from real tasks
function generateWeeklyData(tasks: Task[]) {
  const dayCounts = DAY_NAMES.map(() => 0);

  tasks.forEach(task => {
    if (!task.dueDate) return;
    try {
      const date = new Date(task.dueDate);
      if (isNaN(date.getTime())) return;
      const dayIdx = (date.getDay() + 6) % 7; // Mon=0
      dayCounts[dayIdx] += 1;
    } catch { /* skip bad dates */ }
  });

  return DAY_NAMES.map((name, i) => ({
    name,
    value: dayCounts[i],
    color: DAY_COLORS[i],
  }));
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

const Dashboard: React.FC<DashboardProps> = ({ tasks, projects, team }) => {
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length || 1;
  const efficiency = Math.round((completedTasks / totalTasks) * 100);

  const chartData = generateWeeklyData(tasks);

  const stats = [
    { label: 'Total Projects', value: projects.length, change: `${projects.length}`, isPositive: true, icon: 'folder_special', color: 'text-blue-500' },
    { label: 'Pending Tasks', value: pendingTasks, change: `${pendingTasks}`, isPositive: true, icon: 'task', color: 'text-purple-500' },
    { label: 'Efficiency Rate', value: `${efficiency}%`, change: `${efficiency}%`, isPositive: efficiency >= 50, icon: 'speed', color: 'text-orange-500' },
    { label: 'Team Members', value: team.length, change: `${team.length}`, isPositive: true, icon: 'group', color: 'text-emerald-500' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-[1.5rem] bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
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
                <Bar dataKey="value" radius={[14, 14, 14, 14]} barSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-[500px]">
          <h2 className="text-2xl font-black absolute top-12 left-12">Productivity Index</h2>
          <div className="relative flex items-center justify-center mt-12">
            <svg className="w-72 h-72 transform -rotate-90">
              <circle cx="144" cy="144" r="120" fill="none" stroke="currentColor" strokeWidth="24" className="text-slate-100 dark:text-slate-800/40" />
              <circle
                cx="144" cy="144" r="120" fill="none" stroke="#2badee" strokeWidth="24"
                strokeDasharray={754} strokeDashoffset={754 * (1 - efficiency / 100)}
                strokeLinecap="round" className="transition-all duration-1200 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white">{efficiency}%</span>
              <span className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Goal Reached</span>
            </div>
          </div>
          <div className="w-full mt-14 grid grid-cols-2 gap-6 px-4">
            <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Live Efforts</p>
              <p className="text-2xl font-black text-primary">{tasks.filter(t => t.status !== 'Done').length}</p>
            </div>
            <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved</p>
              <p className="text-2xl font-black text-emerald-500">{completedTasks}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
