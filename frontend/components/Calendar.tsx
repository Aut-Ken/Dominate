
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

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // getDay() returns 0=Sun, we need Mon=0, so shift: (day + 6) % 7
  const firstDayOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const isToday = (day: number) =>
    viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() &&
    day === today.getDate();

  const formatDateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const getTasksForDay = (day: number) => {
    const dateStr = formatDateStr(day);
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      // Match ISO date prefix (e.g. "2026-02-16T15:57:02...")
      if (t.dueDate.startsWith(dateStr)) return true;
      // Match exact date string
      if (t.dueDate === dateStr) return true;
      return false;
    });
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOffset }, (_, i) => i);

  return (
    <div className="p-8 h-full bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar">
      <div className="bg-white dark:bg-surface-dark rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 min-h-[900px] flex flex-col overflow-hidden">
        <div className="h-24 flex items-center justify-between px-10 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl">
          <div className="flex items-center gap-10">
            <h2 className="text-3xl font-black tracking-tight">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
            <div className="flex items-center bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-inner">
              <button onClick={goToPrevMonth} className="w-10 h-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center transition-all"><span className="material-icons-outlined text-lg">chevron_left</span></button>
              <button onClick={goToToday} className="px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Today</button>
              <button onClick={goToNextMonth} className="w-10 h-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center transition-all"><span className="material-icons-outlined text-lg">chevron_right</span></button>
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

        <div className="grid grid-cols-7 flex-1">
          {/* Blank cells for offset */}
          {blanks.map(i => (
            <div key={`blank-${i}`} className="border-b border-r border-slate-100 dark:border-slate-800/50 p-3 min-h-[160px] bg-slate-50/20 dark:bg-slate-900/10"></div>
          ))}
          {monthDays.map(day => {
            const dayTasks = getTasksForDay(day);
            const dateStr = formatDateStr(day);
            return (
              <div key={day} className="border-b border-r border-slate-100 dark:border-slate-800/50 p-3 min-h-[160px] hover:bg-primary/5 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                  <span className={`text-sm font-black transition-all ${isToday(day) ? 'flex items-center justify-center w-8 h-8 bg-primary text-white rounded-xl shadow-xl' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddClick(dateStr); }}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg transition-all scale-75 hover:scale-110 active:scale-95 z-20"
                  >
                    <span className="material-icons-outlined text-xs font-black">add</span>
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 max-h-[100px] overflow-hidden">
                  {dayTasks.map((task) => (
                    <div key={task.id} className={`px-2 py-1 rounded-md text-[9px] font-black truncate shadow-sm border-l-4 ${task.type === 'mission' ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400' : 'bg-primary/10 border-primary text-primary'
                      }`}>
                      {task.title}
                    </div>
                  ))}
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
