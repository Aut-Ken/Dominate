
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Task, Project } from '../types';

interface ReportsProps {
  tasks: Task[];
  projects: Project[];
  currentUserId: string | null;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = ['#2badee', '#1a262d', '#8b5cf6', '#334155'];

// Generate velocity data from real tasks, grouping by day of week
function generateVelocityData(tasks: Task[], currentUserId: string | null) {
  const dayCounts = DAY_NAMES.map(() => ({ team: 0, me: 0 }));

  tasks.forEach(task => {
    if (!task.dueDate) return;
    try {
      const date = new Date(task.dueDate);
      if (isNaN(date.getTime())) return;
      // getDay() returns 0=Sun, shift to Mon=0
      const dayIdx = (date.getDay() + 6) % 7;
      dayCounts[dayIdx].team += 1;
      if (currentUserId && task.assigneeId === currentUserId) {
        dayCounts[dayIdx].me += 1;
      }
    } catch { /* skip bad dates */ }
  });

  return DAY_NAMES.map((name, i) => ({
    name,
    team: dayCounts[i].team,
    me: dayCounts[i].me,
  }));
}

const Reports: React.FC<ReportsProps> = ({ tasks, projects, currentUserId }) => {
  const myTasks = tasks.filter(t => currentUserId ? t.assigneeId === currentUserId : false);
  const myCompleted = myTasks.filter(t => t.status === 'Done').length;
  const teamCompleted = tasks.filter(t => t.status === 'Done').length;

  const performanceData = generateVelocityData(tasks, currentUserId);

  const distributionData = [
    { name: 'Done', value: teamCompleted },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length },
    { name: 'To Do', value: tasks.filter(t => t.status === 'To Do').length },
    { name: 'Review', value: tasks.filter(t => t.status === 'Review').length },
  ];

  const personalData = [
    { name: 'Done', value: myCompleted },
    { name: 'Pending', value: Math.max(0, myTasks.length - myCompleted) },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tight">Performance Analytics</h2>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Comparative data for the whole squad and your individual metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Team Velocity</p>
          <p className="text-4xl font-black">{tasks.length > 0 ? (teamCompleted / 7).toFixed(1) : '0.0'}</p>
          <p className="text-[10px] text-primary font-bold mt-2 tracking-widest uppercase">Avg Tasks / Day</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Efficiency</p>
          <p className="text-4xl font-black text-purple-500">{myTasks.length > 0 ? Math.round((myCompleted / myTasks.length) * 100) : 0}%</p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-widest uppercase">Completion Rate</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Health Index</p>
          <p className="text-4xl font-black text-emerald-500 font-display">{myTasks.length === 0 ? 'N/A' : myCompleted / myTasks.length >= 0.5 ? 'OPTIMAL' : 'AT RISK'}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-widest uppercase">System Status</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">My Active Load</p>
          <p className="text-4xl font-black">{myTasks.filter(t => t.status !== 'Done').length}</p>
          <p className="text-[10px] text-blue-500 font-bold mt-2 tracking-widest uppercase">Pending Work</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-surface-dark p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-10 px-4">
            <h2 className="text-xl font-black">Velocity Benchmarks</h2>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/40"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/40"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Input</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorTeam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2badee" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2badee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a262d', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="team" stroke="#2badee" fillOpacity={1} fill="url(#colorTeam)" strokeWidth={4} />
                <Area type="monotone" dataKey="me" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMe)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-surface-dark p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[500px]">
            <h2 className="text-xl font-black mb-10 text-center uppercase tracking-widest">Team Status</h2>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a262d', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-2xl font-black leading-none">{tasks.length}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[500px]">
            <h2 className="text-xl font-black mb-10 text-center uppercase tracking-widest">My Personal Status</h2>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={personalData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#1a262d" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a262d', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-2xl font-black leading-none">{myTasks.length}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Mine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
