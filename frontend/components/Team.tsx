
import React, { useState } from 'react';
import { Task, TeamMember } from '../types';

interface TeamProps {
  tasks: Task[];
  members: TeamMember[];
  onNavigateToProfile: (member: TeamMember) => void;
  onUpdateMember: (member: TeamMember) => void;
}

function MemberAvatar({ src, name, size = 'w-20 h-20' }: { src?: string; name: string; size?: string }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || '?')[0]?.toUpperCase() || '?';
  if (!src || failed) {
    return (
      <div className={`${size} rounded-[2rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-2xl group-hover:scale-105 transition-transform`}>
        {initial}
      </div>
    );
  }
  return <img src={src} className={`${size} rounded-[2rem] object-cover group-hover:scale-105 transition-transform`} alt={name} onError={() => setFailed(true)} />;
}

const Team: React.FC<TeamProps> = ({ tasks, members, onNavigateToProfile, onUpdateMember }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All Squads');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filter === 'All Squads' || m.department === filter)
  );

  const handleInvite = () => {
    const email = prompt("Enter member's email to invite:");
    if (email) alert(`Invitation sent to ${email}!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      onUpdateMember(editingMember);
      setEditingMember(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between gap-8 items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"><span className="material-icons-outlined">search</span></span>
          <input
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-black focus:ring-8 focus:ring-primary/5 transition-all uppercase tracking-widest"
            placeholder="Search Squad..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 py-5 px-8 rounded-3xl text-[10px] font-black uppercase tracking-widest focus:ring-8 focus:ring-primary/5 cursor-pointer"
          >
            <option>All Squads</option>
            <option>Development</option>
            <option>Management</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>QA</option>
          </select>
          <button className="p-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 hover:text-primary transition-all">
            <span className="material-icons-outlined">tune</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {filteredMembers.map((member, idx) => (
          <div key={member.id} className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all group hover:-translate-y-1" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="flex justify-between items-start mb-6">
              <div className="relative">
                <MemberAvatar src={member.avatar} name={member.name} />
                <span className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white dark:border-surface-dark rounded-full ${member.status === 'Online' ? 'bg-green-500' : member.status === 'Away' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
              </div>
              <button onClick={() => setEditingMember(member)} className="text-slate-300 hover:text-primary p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all">
                <span className="material-icons-outlined font-black">edit</span>
              </button>
            </div>
            <h3 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{member.role}</p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black rounded-xl uppercase tracking-widest">{member.department}</span>
              <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-500 text-[8px] font-black rounded-xl uppercase tracking-widest">{member.location}</span>
            </div>
            <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
              <div>
                <p className="text-xl font-black">{tasks.filter(t => t.assigneeId === member.userId || t.assignee === member.name).length}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Tasks</p>
              </div>
              <button onClick={() => onNavigateToProfile(member)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">Profile</button>
            </div>
          </div>
        ))}
        <div onClick={handleInvite} className="bg-slate-50/50 dark:bg-surface-dark/30 rounded-[3rem] border-[6px] border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-10 cursor-pointer hover:bg-white dark:hover:bg-surface-dark/60 transition-all group min-h-[350px] shadow-inner">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl group-hover:bg-primary group-hover:text-white transition-all">
            <span className="material-icons-outlined text-3xl">person_add</span>
          </div>
          <h4 className="text-lg font-black uppercase tracking-widest">New Talent</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Invite squadmate</p>
        </div>
      </div>

      {editingMember && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-bold mb-6">Edit Team Member: {editingMember.name}</h3>
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm"
                  value={editingMember.role}
                  onChange={e => setEditingMember({ ...editingMember, role: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location Status</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm"
                  value={editingMember.location}
                  onChange={e => setEditingMember({ ...editingMember, location: e.target.value as any })}
                >
                  <option value="Remote">Remote</option>
                  <option value="In-Office">In-Office</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingMember(null)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/30">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
