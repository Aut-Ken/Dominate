
import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  onAddClick: (date: string) => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Calendar: React.FC<CalendarProps> = ({ tasks, onAddClick }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const isToday = (day: number) =>
    viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() &&
    day === today.getDate();

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const formatDateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const getTasksForDay = (day: number) => {
    const dateStr = formatDateStr(day);
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      if (t.dueDate.startsWith(dateStr)) return true;
      if (t.dueDate === dateStr) return true;
      return false;
    });
  };

  const goToPrevMonth = () => {
    setSlideDirection('right');
    setAnimKey(k => k + 1);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    setSlideDirection('left');
    setAnimKey(k => k + 1);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToToday = () => {
    setSlideDirection(null);
    setAnimKey(k => k + 1);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOffset }, (_, i) => i);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="p-8 h-full bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      <div className="bg-white dark:bg-surface-dark rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 min-h-[900px] flex flex-col overflow-hidden">
        <div className="h-24 flex items-center justify-between px-10 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl">
          <div className="flex items-center gap-10">
            <h2 className="text-3xl font-black tracking-tight">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
            <div className="flex items-center bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-inner">
              <button onClick={goToPrevMonth} className="w-10 h-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center transition-all active:scale-90"><span className="material-icons-outlined text-lg">chevron_left</span></button>
              <button
                onClick={goToToday}
                className={`px-6 text-[10px] font-black uppercase tracking-widest transition-colors ${isCurrentMonth ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
              >
                Today
              </button>
              <button onClick={goToNextMonth} className="w-10 h-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center transition-all active:scale-90"><span className="material-icons-outlined text-lg">chevron_right</span></button>
            </div>
          </div>
          <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white dark:bg-primary text-slate-800 dark:text-white shadow-2xl">Month</button>
            <button className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-500">Week</button>
            <button className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-500">Day</button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{day}</div>
          ))}
        </div>

        <div
          key={animKey}
          className={`grid grid-cols-7 flex-1 ${slideDirection === 'left' ? 'animate-in slide-in-from-right-4 fade-in duration-300' : slideDirection === 'right' ? 'animate-in slide-in-from-left-4 fade-in duration-300' : 'animate-in fade-in duration-300'}`}
        >
          {blanks.map(i => (
            <div key={`blank-${i}`} className="border-b border-r border-slate-100 dark:border-slate-800/50 p-3 min-h-[160px] bg-slate-50/20 dark:bg-slate-900/10"></div>
          ))}
          {monthDays.map(day => {
            const dayTasks = getTasksForDay(day);
            const dateStr = formatDateStr(day);
            const past = isPast(day) && !isToday(day);
            return (
              <div key={day} className={`border-b border-r border-slate-100 dark:border-slate-800/50 p-3 min-h-[160px] hover:bg-primary/5 transition-all group relative overflow-hidden ${past ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start z-10 relative">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black transition-all ${isToday(day) ? 'flex items-center justify-center w-8 h-8 bg-primary text-white rounded-xl shadow-xl animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                    {dayTasks.length > 2 && (
                      <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{dayTasks.length}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddClick(dateStr); }}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg transition-all scale-75 hover:scale-110 active:scale-95 z-20"
                  >
                    <span className="material-icons-outlined text-xs font-black">add</span>
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 max-h-[100px] overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className={`px-2 py-1 rounded-md text-[9px] font-black truncate shadow-sm border-l-4 ${task.type === 'mission' ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400' : task.status === 'Done' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 line-through opacity-60' : 'bg-primary/10 border-primary text-primary'
                      }`}>
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="text-[8px] font-black text-slate-400 px-2">+{dayTasks.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
