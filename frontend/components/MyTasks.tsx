
import React, { useState } from 'react';
import { Task } from '../types';

interface MyTasksProps {
   tasks: Task[];
   onUpdateStatus: (taskId: string, status: Task['status']) => void;
   currentUserId: string | null;
}

const MyTasks: React.FC<MyTasksProps> = ({ tasks, onUpdateStatus, currentUserId }) => {
   const [activeTab, setActiveTab] = useState<'All' | 'Today' | 'Upcoming'>('All');

   const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2026-02-16"

   const filteredTasks = tasks.filter(task => {
      // Filter by assigneeId
      const isMine = currentUserId ? task.assigneeId === currentUserId : false;
      if (!isMine) return false;

      if (activeTab === 'Today') {
         if (!task.dueDate) return false;
         // Match if dueDate starts with today's date string
         return task.dueDate.startsWith(todayStr);
      }
      if (activeTab === 'Upcoming') {
         if (!task.dueDate) return false;
         if (task.status === 'Done') return false;
         // Parse the date and check if it's in the future
         try {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return dueDate > today;
         } catch {
            return false;
         }
      }
      return true; // 'All' tab
   });

   return (
      <div className="p-8 max-w-6xl mx-auto space-y-12 pb-32">
         <div className="flex justify-between items-center">
            <div className="bg-slate-100 dark:bg-slate-900/50 p-2 rounded-[2.5rem] flex gap-2 border border-slate-200 dark:border-slate-800 shadow-inner">
               {(['All', 'Today', 'Upcoming'] as const).map(tab => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-12 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-2xl shadow-primary/40' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>

         <div className="bg-white dark:bg-surface-dark rounded-[3.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50">
                     <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Task Objective</th>
                     <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                     <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                     <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Deadline</th>
                     <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Settings</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredTasks.length === 0 && (
                     <tr>
                        <td colSpan={5} className="px-12 py-16 text-center text-slate-400 text-sm font-bold">
                           {activeTab === 'Today' ? 'No tasks due today.' : activeTab === 'Upcoming' ? 'No upcoming tasks.' : 'No tasks assigned to you.'}
                        </td>
                     </tr>
                  )}
                  {filteredTasks.map(task => {
                     // Format date for display
                     let displayDate = task.dueDate || '';
                     try {
                        if (task.dueDate) {
                           const d = new Date(task.dueDate);
                           if (!isNaN(d.getTime())) {
                              displayDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                           }
                        }
                     } catch { /* use raw */ }

                     return (
                        <tr key={task.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors group">
                           <td className="px-12 py-10">
                              <div className="flex items-center gap-6">
                                 <button onClick={() => onUpdateStatus(task.id, task.status === 'Done' ? 'To Do' : 'Done')} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.status === 'Done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 hover:border-primary'}`}>
                                    {task.status === 'Done' && <span className="material-icons-outlined text-sm font-black">check</span>}
                                 </button>
                                 <div>
                                    <p className={`text-lg font-black tracking-tight ${task.status === 'Done' ? 'line-through opacity-30' : 'text-slate-900 dark:text-white'}`}>{task.title}</p>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Project: {task.projectId}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-12 py-10">
                              <span className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 rounded-2xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{task.status}</span>
                           </td>
                           <td className="px-12 py-10">
                              <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-500 text-white' : task.priority === 'Medium' ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-700'}`}>{task.priority}</span>
                           </td>
                           <td className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">{displayDate}</td>
                           <td className="px-12 py-10 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-primary transition-colors flex items-center justify-center"><span className="material-icons-outlined text-sm">edit</span></button>
                                 <button className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><span className="material-icons-outlined text-sm">delete</span></button>
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default MyTasks;
