
import React, { useState } from 'react';
import { Task, Project } from '../types';

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  onOpenModal: (status: Task['status'], projectId?: string) => void;
  onAddTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  currentUserId: string | null;
}

const Projects: React.FC<ProjectsProps> = ({ projects, tasks, onOpenModal, onAddTask, onUpdateStatus, currentUserId }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-slate-400';
      case 'In Progress': return 'bg-primary';
      case 'Review': return 'bg-purple-500';
      case 'Done': return 'bg-green-500';
      default: return 'bg-slate-400';
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
        <h2 className="text-2xl font-black">Active Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} onClick={() => setSelectedProjectId(project.id)} className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
              <div className="flex justify-between mb-8">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">#{project.id}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black rounded-full uppercase tracking-widest">{project.status}</span>
              </div>
              <h3 className="text-2xl font-black mb-6 group-hover:text-primary transition-colors leading-tight">{project.name}</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invite Key</span>
                <span className="font-mono text-primary font-black tracking-widest select-all">{project.inviteCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => <img key={i} src={`https://picsum.photos/seed/${project.id}${i}/100/100`} className="w-10 h-10 rounded-full border-4 border-white dark:border-surface-dark" alt="m" />)}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</p>
                  <p className="text-xl font-black">{tasks.filter(t => t.projectId === project.id).length}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="px-10 py-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-surface-dark/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => setSelectedProjectId(null)} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500">
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-3xl font-black">{selectedProject?.name} <span className="text-xs font-bold text-slate-400 ml-2">#{selectedProject?.id}</span></h2>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Invitation Key: <span className="text-primary">{selectedProject?.inviteCode}</span></p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="flex gap-10 min-w-max h-full">
          {(['To Do', 'In Progress', 'Review', 'Done'] as Task['status'][]).map((col) => (
            <div key={col} className="w-80 flex flex-col">
              <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(col)}`}></span>
                  <h3 className="font-black uppercase tracking-widest text-sm">{col}</h3>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500">{projectTasks.filter(t => t.status === col).length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 pr-4 custom-scrollbar pb-20">
                {projectTasks.filter(t => t.status === col).map(task => (
                  <div key={task.id} className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative group">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {task.priority}
                      </span>
                      {col !== 'Done' && (task.assigneeId === currentUserId) && (
                        <button
                          onClick={() => onUpdateStatus(task.id, 'Done')}
                          className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-300 hover:bg-green-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                          title="Mark as done"
                        >
                          <span className="material-icons-outlined text-sm font-black">check</span>
                        </button>
                      )}
                    </div>
                    <h4 className={`text-sm font-black mb-3 leading-tight ${col === 'Done' ? 'line-through opacity-30' : ''}`}>{task.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">{task.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <img src={task.assigneeAvatar} className="w-6 h-6 rounded-full shadow-sm" alt="a" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80px]">{task.assignee}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                        <span className="material-icons-outlined text-xs">schedule</span> {task.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
                {col !== 'Done' && (
                  <button
                    onClick={() => onOpenModal(col, selectedProjectId || undefined)}
                    className="w-full py-5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-outlined text-sm">add</span> ADD TASK
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
