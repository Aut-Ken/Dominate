
import React, { useState } from 'react';
import { Task, Project, TeamMember } from '../types';

interface TaskModalProps {
  type: 'task' | 'mission';
  dateHint: string | null;
  projects: Project[];
  teamMembers: TeamMember[];
  currentUser?: TeamMember;
  defaultProjectId?: string | null;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ type, dateHint, projects, teamMembers, currentUser, defaultProjectId, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    projectId: defaultProjectId || projects[0]?.id,
    assignee: type === 'mission' ? currentUser?.name : (currentUser?.name || teamMembers[0]?.name),
    assigneeId: type === 'mission' ? currentUser?.userId : (currentUser?.userId || teamMembers[0]?.userId),
    dueDate: dateHint || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold">{type === 'mission' ? 'Add Personal Mission' : 'Create Squad Task'}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><span className="material-icons-outlined">close</span></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{type === 'mission' ? 'Mission Subject' : 'Task Title'}</label>
            <input
              autoFocus
              type="text"
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-bold placeholder:font-normal"
              placeholder={type === 'mission' ? "What's on your mind today?" : "What needs to be done?"}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Assignee</label>
              {type === 'mission' ? (
                <div className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-none rounded-xl text-sm font-bold text-slate-500 flex items-center gap-2">
                  <span className="material-icons-outlined text-sm">lock</span> {currentUser?.name || 'Me'} (Personal)
                </div>
              ) : (
                <select
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-bold"
                  value={formData.assigneeId}
                  onChange={(e) => {
                    const selectedMember = teamMembers.find(m => m.userId === e.target.value);
                    setFormData({ ...formData, assigneeId: e.target.value, assignee: selectedMember?.name });
                  }}
                >
                  {teamMembers.map(m => <option key={m.id} value={m.userId}>{m.name}</option>)}
                </select>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Execution Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-bold"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Project Hub</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-bold"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Priority Intensity</label>
            <div className="flex gap-2">
              {(['Low', 'Medium', 'High'] as Task['priority'][]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${formData.priority === p
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                    : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/50'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Details</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-medium resize-none"
              placeholder="Additional requirements or thoughts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">Discard</button>
            <button type="submit" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
              {type === 'mission' ? 'Add Personal Mission' : 'Create Squad Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
