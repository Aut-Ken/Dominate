
import React, { useState } from 'react';
import { Task, Project } from '../types';
import { api } from '../services/api';

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  onOpenModal: (status: Task['status'], projectId?: string) => void;
  onAddTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  currentUserId: string | null;
  onTaskClick?: (task: Task) => void;
  onProjectsRefresh?: () => void;
}

const AVATAR_COLORS = ['#2badee', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1', '#14b8a6'];
const STATUSES: Task['status'][] = ['To Do', 'In Progress', 'Review', 'Done'];

function getInitialAvatar(name: string | undefined, index: number) {
  const initial = (name || '?')[0]?.toUpperCase() || '?';
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return { initial, color };
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function AvatarImg({ src, name, size = 'w-6 h-6' }: { src?: string; name?: string; size?: string }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || '?')[0]?.toUpperCase() || '?';
  if (!src || failed) {
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-sm shrink-0`}>
        {initial}
      </div>
    );
  }
  return <img src={src} className={`${size} rounded-full shadow-sm object-cover shrink-0`} alt={name || 'a'} onError={() => setFailed(true)} />;
}

const Projects: React.FC<ProjectsProps> = ({ projects, tasks, onOpenModal, onAddTask, onUpdateStatus, currentUserId, onTaskClick, onProjectsRefresh }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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

  const handleJoinProject = async () => {
    if (!inviteCode.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const result = await api.joinProject(inviteCode.trim());
      if ((result as any).error) { setJoinError((result as any).error); }
      else { setShowJoinModal(false); setInviteCode(''); onProjectsRefresh?.(); }
    } catch { setJoinError('Failed to join project.'); }
    finally { setJoining(false); }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    (e.target as HTMLElement).style.opacity = '0.5';
  };
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    (e.target as HTMLElement).style.opacity = '1';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTaskId) {
      const task = tasks.find(t => t.id === draggedTaskId);
      if (task && task.status !== targetStatus) {
        onUpdateStatus(draggedTaskId, targetStatus);
      }
    }
    setDraggedTaskId(null);
  };

  if (!selectedProjectId) {
    if (projects.length === 0) {
      return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center h-full pb-20 animate-in fade-in duration-500">
          <div className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mb-8">
            <span className="material-icons-outlined text-6xl text-primary">rocket_launch</span>
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tight">No Projects Yet</h2>
          <p className="text-sm text-slate-400 font-bold mb-10 text-center max-w-md">Create your first project or join an existing one with an invite code.</p>
          <div className="flex gap-4">
            <button
              onClick={() => onOpenModal('To Do')}
              className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <span className="material-icons-outlined text-sm">add</span> Create Project
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-slate-200 dark:border-slate-700"
            >
              <span className="material-icons-outlined text-sm">group_add</span> Join Project
            </button>
          </div>
          {renderJoinModal()}
        </div>
      );
    }

    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black">Active Projects</h2>
          <button onClick={() => setShowJoinModal(true)}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <span className="material-icons-outlined text-sm">vpn_key</span> Join with Code
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const projTaskCount = tasks.filter(t => t.projectId === project.id).length;
            return (
              <div key={project.id} onClick={() => setSelectedProjectId(project.id)} className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-1">
                <div className="flex justify-between mb-8">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">#{project.id.slice(0, 8)}</span>
                  <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${project.status === 'Active' ? 'bg-green-100 text-green-700' : project.status === 'On Hold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{project.status}</span>
                </div>
                <h3 className="text-2xl font-black mb-6 group-hover:text-primary transition-colors leading-tight">{project.name}</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invite Key</span>
                  <span className="font-mono text-primary font-black tracking-widest select-all">{project.inviteCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {[0, 1, 2].map(i => {
                      const { initial, color } = getInitialAvatar(project.name, i);
                      return (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-surface-dark flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: color }}>
                          {initial}
                        </div>
                      );
                    })}
                    {project.memberCount > 3 && (
                      <div className="w-10 h-10 rounded-full border-4 border-white dark:border-surface-dark bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500">
                        +{project.memberCount - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</p>
                    <p className="text-xl font-black">{projTaskCount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {renderJoinModal()}
      </div>
    );
  }

  function renderJoinModal() {
    if (!showJoinModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowJoinModal(false)}>
        <div className="bg-white dark:bg-surface-dark w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-black mb-2">Join a Project</h3>
          <p className="text-xs text-slate-400 font-bold mb-6">Enter the invite code shared with you.</p>
          <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="e.g. ABC123"
            onKeyDown={e => { if (e.key === 'Enter') handleJoinProject(); }}
            className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-primary mb-4 font-mono tracking-widest text-center text-lg" />
          {joinError && <p className="text-sm text-red-500 font-bold mb-4">{joinError}</p>}
          <div className="flex gap-3">
            <button onClick={() => setShowJoinModal(false)} className="flex-1 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-2xl">Cancel</button>
            <button onClick={handleJoinProject} disabled={joining || !inviteCode.trim()}
              className="flex-1 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <span className="material-icons-outlined text-sm">group_add</span> {joining ? 'Joining...' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-hidden animate-in fade-in duration-300">
      <div className="px-10 py-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-surface-dark/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => setSelectedProjectId(null)} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500">
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-3xl font-black">{selectedProject?.name} <span className="text-xs font-bold text-slate-400 ml-2">#{selectedProject?.id.slice(0, 8)}</span></h2>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Invitation Key: <span className="text-primary">{selectedProject?.inviteCode}</span> <span className="text-slate-300 mx-1">•</span> Drag tasks to change status</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="flex gap-10 min-w-max h-full">
          {STATUSES.map((col) => {
            const colTasks = projectTasks.filter(t => t.status === col);
            return (
              <div key={col} className="w-80 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, col)}>
                <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(col)}`}></span>
                    <h3 className="font-black uppercase tracking-widest text-sm">{col}</h3>
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500">{colTasks.length}</span>
                  </div>
                </div>

                <div className={`flex-1 overflow-y-auto space-y-5 pr-4 custom-scrollbar pb-20 rounded-2xl transition-colors ${draggedTaskId ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}>
                  {colTasks.length === 0 && (
                    <div className="text-center py-12 text-slate-300 dark:text-slate-600">
                      <span className="material-icons-outlined text-4xl mb-3 block">inbox</span>
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        {draggedTaskId ? 'Drop here' : 'No tasks here'}
                      </p>
                    </div>
                  )}
                  {colTasks.map(task => {
                    const taskTags = typeof task.tags === 'string' ? (task.tags as string).split(',').map(t => t.trim()).filter(Boolean) : (task.tags || []);
                    return (
                      <div key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onTaskClick?.(task)}
                        className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-500 text-white' : task.priority === 'Medium' ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-700'}`}>
                            {task.priority}
                          </span>
                          <div className="flex items-center gap-1">
                            {(task.commentsCount || 0) > 0 && (
                              <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
                                <span className="material-icons-outlined text-xs">chat_bubble_outline</span> {task.commentsCount}
                              </span>
                            )}
                            {col !== 'Done' && (task.assigneeId === currentUserId) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, 'Done'); }}
                                className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-300 hover:bg-green-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                title="Mark as done"
                              >
                                <span className="material-icons-outlined text-sm font-black">check</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <h4 className={`text-sm font-black mb-3 leading-tight ${col === 'Done' ? 'line-through opacity-30' : ''}`}>{task.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                        {/* Tags */}
                        {taskTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {taskTags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 text-[8px] font-black rounded-full bg-primary/10 text-primary uppercase tracking-wider">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <AvatarImg src={task.assigneeAvatar} name={task.assignee} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80px]">{task.assignee}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                            <span className="material-icons-outlined text-xs">schedule</span> {formatDate(task.dueDate)}
                          </span>
                        </div>
                        {/* Drag handle indicator */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-icons-outlined text-slate-300 text-sm">drag_indicator</span>
                        </div>
                      </div>
                    );
                  })}
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
            );
          })}
        </div>
      </div>
      {renderJoinModal()}
    </div>
  );
};

export default Projects;
