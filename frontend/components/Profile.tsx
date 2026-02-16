import React, { useState, useEffect, useRef } from 'react';
import { Task, TeamMember } from '../types';
import { api } from '../services/api';

interface ProfileProps {
   tasks: Task[];
   member: TeamMember;
   isMe: boolean;
   onUpdate: (member: TeamMember) => void;
}

const API_HOST = 'http://localhost:8080';

function ProfileAvatar({ src, name, size = 'w-36 h-36' }: { src?: string; name: string; size?: string }) {
   const [failed, setFailed] = useState(false);
   const initial = (name || '?')[0]?.toUpperCase() || '?';
   const imgSrc = src?.startsWith('/uploads') ? `${API_HOST}${src}` : src;
   if (!src || failed) {
      return (
         <div className={`${size} rounded-full border-[6px] border-white dark:border-background-dark shadow-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-5xl`}>
            {initial}
         </div>
      );
   }
   return <img src={imgSrc} className={`${size} rounded-full border-[6px] border-white dark:border-background-dark shadow-2xl object-cover`} alt={name} onError={() => setFailed(true)} />;
}

const Profile: React.FC<ProfileProps> = ({ tasks, member, isMe, onUpdate }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [info, setInfo] = useState({ ...member });
   const [skills, setSkills] = useState(['Agile', 'Figma', 'React', 'Team Ops', 'SQL', 'Strategy']);
   const [newSkill, setNewSkill] = useState('');
   const avatarInputRef = useRef<HTMLInputElement>(null);
   const [uploadingAvatar, setUploadingAvatar] = useState(false);

   useEffect(() => {
      setInfo({ ...member });
   }, [member]);

   const handleSave = () => {
      onUpdate(info);
      setIsEditing(false);
   };

   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingAvatar(true);
      try {
         const result = await api.updateAvatar(member.userId || member.id, file);
         if (result.avatar) {
            const updated = { ...member, avatar: result.avatar };
            onUpdate(updated);
            setInfo(updated);
         }
      } catch (err) { console.error('Avatar upload failed:', err); }
      finally { setUploadingAvatar(false); if (avatarInputRef.current) avatarInputRef.current.value = ''; }
   };

   const completedCount = tasks.filter(t => (t.assigneeId === member.userId || t.assignee === member.name) && t.status === 'Done').length;
   const totalCount = tasks.filter(t => t.assigneeId === member.userId || t.assignee === member.name).length;
   const inProgressCount = tasks.filter(t => (t.assigneeId === member.userId || t.assignee === member.name) && t.status === 'In Progress').length;
   const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

   return (
      <div className="p-8 max-w-5xl mx-auto pb-32 animate-in fade-in duration-500">
         {/* Banner + Avatar Section - Avatar placed OUTSIDE overflow-hidden banner */}
         <div className="relative mb-8">
            {/* Background Banner */}
            <div className="h-56 bg-gradient-to-br from-primary via-indigo-600 to-purple-700 rounded-[2.5rem] shadow-xl overflow-hidden">
               <div className="absolute inset-0 h-56 rounded-[2.5rem] overflow-hidden">
                  <div className="absolute inset-0 opacity-10"
                     style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
               </div>
            </div>

            {/* Avatar + Name - positioned below the banner, overlapping it */}
            <div className="flex items-end gap-6 px-10 -mt-20 relative z-10">
               <div className="relative shrink-0">
                  <ProfileAvatar src={member.avatar} name={member.name} />
                  {isMe && (
                     <>
                        <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                           className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full border-4 border-white dark:border-background-dark shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50">
                           <span className="material-icons-outlined text-sm">{uploadingAvatar ? 'hourglass_empty' : 'photo_camera'}</span>
                        </button>
                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                     </>
                  )}
               </div>
               <div className="pb-2">
                  <h2 className="text-3xl font-black tracking-tight">{member.name}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                     <span className="px-3 py-1 text-[9px] font-black bg-primary/10 text-primary rounded-full uppercase tracking-widest">{member.role || 'Member'}</span>
                     <span className="text-xs text-slate-400 font-bold">{member.department || ''}</span>
                     <span className="text-xs text-slate-400">•</span>
                     <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                        <span className="material-icons-outlined text-xs">{member.location === 'Remote' ? 'wifi' : 'apartment'}</span>
                        {member.location || 'Remote'}
                     </span>
                  </div>
               </div>
               {isMe && (
                  <div className="ml-auto pb-2">
                     <button
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isEditing ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white'}`}
                     >
                        <span className="material-icons-outlined text-sm">{isEditing ? 'check' : 'edit'}</span>
                        {isEditing ? 'Save Profile' : 'Edit Profile'}
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-4 gap-4 mb-8">
            {[
               { label: 'Total Tasks', value: totalCount, icon: 'assignment', color: 'text-primary' },
               { label: 'Completed', value: completedCount, icon: 'check_circle', color: 'text-green-500' },
               { label: 'In Progress', value: inProgressCount, icon: 'pending', color: 'text-amber-500' },
               { label: 'Completion', value: `${completionRate}%`, icon: 'trending_up', color: 'text-purple-500' },
            ].map(stat => (
               <div key={stat.label} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className={`material-icons-outlined text-xl ${stat.color} mb-2 block`}>{stat.icon}</span>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - 2 cols wide */}
            <div className="md:col-span-2 space-y-6">
               {/* Identity Info */}
               <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><span className="material-icons-outlined text-primary text-sm">badge</span></span>
                     Identity Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <InfoField label="Full Name" value={member.name} editing={isEditing} editValue={info.name} onChange={v => setInfo({ ...info, name: v })} />
                     <InfoField label="Email Address" value={member.email || 'N/A'} editing={isEditing} editValue={info.email || ''} onChange={v => setInfo({ ...info, email: v })} />
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                        {isEditing ? (
                           <select value={info.department} onChange={e => setInfo({ ...info, department: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-primary outline-none transition-colors">
                              <option value="Product">Product</option>
                              <option value="Development">Development</option>
                              <option value="Design">Design</option>
                              <option value="Engineering">Engineering</option>
                              <option value="Management">Management</option>
                              <option value="Marketing">Marketing</option>
                              <option value="QA">QA</option>
                           </select>
                        ) : (
                           <p className="text-base font-black">{member.department}</p>
                        )}
                     </div>
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Mode</p>
                        {isEditing ? (
                           <select value={info.location} onChange={e => setInfo({ ...info, location: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-primary outline-none transition-colors">
                              <option value="Remote">Remote</option>
                              <option value="In-Office">In-Office</option>
                              <option value="Hybrid">Hybrid</option>
                           </select>
                        ) : (
                           <p className="text-base font-black">{member.location}</p>
                        )}
                     </div>
                  </div>
               </div>

               {/* Bio */}
               <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><span className="material-icons-outlined text-indigo-500 text-sm">description</span></span>
                     About
                  </h3>
                  <textarea
                     readOnly={!isEditing}
                     value={isEditing ? info.bio : (member.bio || 'Excellence in every pixel and every line of code. Dedicated to team success and product growth.')}
                     onChange={e => setInfo({ ...info, bio: e.target.value })}
                     className={`w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 text-slate-500 dark:text-slate-400 leading-relaxed text-sm min-h-[140px] transition-all resize-none outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary focus:border-primary' : 'cursor-default'}`}
                  />
               </div>

               {/* Recent Activity */}
               <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><span className="material-icons-outlined text-green-500 text-sm">history</span></span>
                     Recent Tasks
                  </h3>
                  <div className="space-y-3">
                     {tasks.filter(t => t.assigneeId === member.userId || t.assignee === member.name).slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                           <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.status === 'Done' ? 'bg-green-500' : t.status === 'In Progress' ? 'bg-primary' : t.status === 'Review' ? 'bg-purple-500' : 'bg-slate-400'}`}></span>
                           <span className={`text-sm font-bold flex-1 truncate ${t.status === 'Done' ? 'line-through opacity-40' : ''}`}>{t.title}</span>
                           <span className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase ${t.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : t.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{t.priority}</span>
                           <span className="text-[10px] text-slate-400 font-bold">{t.status}</span>
                        </div>
                     ))}
                     {tasks.filter(t => t.assigneeId === member.userId || t.assignee === member.name).length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                           <span className="material-icons-outlined text-3xl mb-2 block">assignment</span>
                           <p className="text-xs font-bold">No tasks assigned yet</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
               {/* Expertise Stack */}
               <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><span className="material-icons-outlined text-amber-500 text-sm">code</span></span>
                     Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {skills.map(s => (
                        <span key={s} className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary transition-colors cursor-default">{s}</span>
                     ))}
                  </div>
                  {isMe && isEditing && (
                     <div className="mt-6 flex gap-2">
                        <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                           onKeyDown={e => { if (e.key === 'Enter' && newSkill) { setSkills([...skills, newSkill]); setNewSkill(''); } }}
                           className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-primary" placeholder="Add skill..." />
                        <button onClick={() => { if (newSkill) { setSkills([...skills, newSkill]); setNewSkill(''); } }} className="w-10 h-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"><span className="material-icons-outlined text-sm">add</span></button>
                     </div>
                  )}
               </div>

               {/* Contact */}
               <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center"><span className="material-icons-outlined text-purple-500 text-sm">contact_mail</span></span>
                     Contact
                  </h3>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <span className="material-icons-outlined text-slate-400 text-lg">email</span>
                        <span className="text-sm font-bold truncate">{member.email || 'Not set'}</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <span className="material-icons-outlined text-slate-400 text-lg">location_on</span>
                        <span className="text-sm font-bold">{member.location || 'Remote'}</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <span className="material-icons-outlined text-slate-400 text-lg">groups</span>
                        <span className="text-sm font-bold">{member.department || 'General'}</span>
                     </div>
                  </div>
               </div>

               {/* Joined info */}
               <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 p-6 rounded-3xl border border-primary/20 text-center">
                  <span className="material-icons-outlined text-primary text-3xl mb-2 block">workspace_premium</span>
                  <p className="text-sm font-black">Team Member</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Active Contributor</p>
               </div>
            </div>
         </div>
      </div>
   );
};

function InfoField({ label, value, editing, editValue, onChange }: { label: string; value: string; editing: boolean; editValue: string; onChange: (v: string) => void }) {
   return (
      <div className="space-y-1.5">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         {editing ? (
            <input value={editValue} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-primary outline-none transition-colors" />
         ) : (
            <p className="text-base font-black">{value}</p>
         )}
      </div>
   );
}

export default Profile;
