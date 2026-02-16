
import React, { useState, useEffect } from 'react';
import { Task, TeamMember } from '../types';

interface ProfileProps {
   tasks: Task[];
   member: TeamMember;
   isMe: boolean;
   onUpdate: (member: TeamMember) => void;
}

const Profile: React.FC<ProfileProps> = ({ tasks, member, isMe, onUpdate }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [info, setInfo] = useState({ ...member });
   const [skills, setSkills] = useState(['Agile', 'Figma', 'React', 'Team Ops', 'SQL', 'Strategy']);
   const [newSkill, setNewSkill] = useState('');

   useEffect(() => {
      setInfo({ ...member });
   }, [member]);

   const handleSave = () => {
      onUpdate(info);
      setIsEditing(false);
   };

   const completedCount = tasks.filter(t => (t.assigneeId === member.userId || t.assignee === member.name) && t.status === 'Done').length;

   return (
      <div className="p-8 max-w-5xl mx-auto space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-500">
         <div className="relative h-72 bg-gradient-to-br from-primary to-indigo-700 rounded-[4rem] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-10 left-16 flex items-end gap-10">
               <div className="relative">
                  <img src={member.avatar} className="w-48 h-48 rounded-[3.5rem] border-[10px] border-white dark:border-background-dark shadow-2xl object-cover" alt="p" />
                  {isMe && (
                     <button className="absolute bottom-2 right-2 w-12 h-12 bg-primary text-white rounded-2xl border-4 border-white dark:border-background-dark shadow-lg flex items-center justify-center hover:scale-110 transition-transform"><span className="material-icons-outlined">photo_camera</span></button>
                  )}
               </div>
               <div className="mb-16">
                  <h2 className="text-5xl font-black text-white drop-shadow-2xl">{member.name}</h2>
                  <p className="text-white/70 font-black uppercase tracking-[0.5em] text-sm mt-3">{member.role}</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-10">
               <div className="bg-white dark:bg-surface-dark p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm relative">
                  <div className="flex justify-between items-center mb-10">
                     <h3 className="text-2xl font-black tracking-tight">Identity Info</h3>
                     {isMe && (
                        <button
                           onClick={isEditing ? handleSave : () => setIsEditing(true)}
                           className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-500 text-white shadow-xl' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white'}`}
                        >
                           {isEditing ? 'Save Profile' : 'Edit Profile'}
                        </button>
                     )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                        {isEditing ? <input value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary" /> : <p className="text-lg font-black">{member.name}</p>}
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                        {isEditing ? <input value={info.email || ''} onChange={e => setInfo({ ...info, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary" /> : <p className="text-lg font-black">{member.email || 'N/A'}</p>}
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                        {isEditing ? (
                           <select value={info.department} onChange={e => setInfo({ ...info, department: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary">
                              <option value="Product">Product</option>
                              <option value="Development">Development</option>
                              <option value="Design">Design</option>
                              <option value="Management">Management</option>
                              <option value="Marketing">Marketing</option>
                              <option value="QA">QA</option>
                           </select>
                        ) : (
                           <p className="text-lg font-black">{member.department}</p>
                        )}
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Hub</p>
                        {isEditing ? (
                           <select value={info.location} onChange={e => setInfo({ ...info, location: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary">
                              <option value="Remote">Remote</option>
                              <option value="In-Office">In-Office</option>
                           </select>
                        ) : (
                           <p className="text-lg font-black">{member.location}</p>
                        )}
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-surface-dark p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-2xl font-black tracking-tight mb-10">Short Bio</h3>
                  <textarea
                     readOnly={!isEditing}
                     value={isEditing ? info.bio : (member.bio || 'Excellence in every pixel and every line of code. Dedicated to team success and product growth.')}
                     onChange={e => setInfo({ ...info, bio: e.target.value })}
                     className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-[2.5rem] p-10 text-slate-500 dark:text-slate-400 leading-relaxed text-sm min-h-[220px] focus:ring-8 focus:ring-primary/5 transition-all resize-none"
                  />
               </div>
            </div>

            <div className="space-y-10">
               <div className="bg-white dark:bg-surface-dark p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8"><span className="material-icons-outlined text-5xl font-black">emoji_events</span></div>
                  <p className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">{152 + completedCount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Finished Tasks</p>
               </div>
               <div className="bg-white dark:bg-surface-dark p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-10">Expertise Stack</h4>
                  <div className="flex flex-wrap gap-3">
                     {skills.map(s => (
                        <span key={s} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 rounded-2xl text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest border border-slate-200 dark:border-slate-800">{s}</span>
                     ))}
                  </div>
                  {isMe && isEditing && (
                     <div className="mt-8 flex gap-2">
                        <input value={newSkill} onChange={e => setNewSkill(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-xs font-bold" placeholder="New Skill..." />
                        <button onClick={() => { if (newSkill) { setSkills([...skills, newSkill]); setNewSkill(''); } }} className="w-10 h-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"><span className="material-icons-outlined">add</span></button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default Profile;
