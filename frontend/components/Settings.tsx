import React, { useState } from 'react';
import { api } from '../services/api';

interface SettingsProps {
   toggleTheme: () => void;
   darkMode: boolean;
   onLogout?: () => void;
   userId?: string | null;
}

const Settings: React.FC<SettingsProps> = ({ toggleTheme, darkMode, onLogout, userId }) => {
   const [emailSummary, setEmailSummary] = useState(true);
   const [pushAlerts, setPushAlerts] = useState(false);
   const [taskReminders, setTaskReminders] = useState(true);
   const [weeklyDigest, setWeeklyDigest] = useState(false);

   // Password change
   const [oldPw, setOldPw] = useState('');
   const [newPw, setNewPw] = useState('');
   const [confirmPw, setConfirmPw] = useState('');
   const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
   const [changingPw, setChangingPw] = useState(false);
   const [showOldPw, setShowOldPw] = useState(false);
   const [showNewPw, setShowNewPw] = useState(false);

   // Language / Timezone (UI-only)
   const [language, setLanguage] = useState('English');
   const [timezone, setTimezone] = useState('UTC+8');

   const handleChangePassword = async () => {
      if (!oldPw || !newPw || !confirmPw) { setPwStatus({ type: 'error', msg: 'All fields are required.' }); return; }
      if (newPw.length < 6) { setPwStatus({ type: 'error', msg: 'New password must be at least 6 characters.' }); return; }
      if (newPw !== confirmPw) { setPwStatus({ type: 'error', msg: 'New passwords do not match.' }); return; }
      setChangingPw(true);
      setPwStatus(null);
      try {
         const result = await api.changePassword(userId || '', oldPw, newPw);
         if (result.error) { setPwStatus({ type: 'error', msg: result.error }); }
         else { setPwStatus({ type: 'success', msg: 'Password changed successfully!' }); setOldPw(''); setNewPw(''); setConfirmPw(''); }
      } catch (e) { setPwStatus({ type: 'error', msg: 'Failed to change password.' }); }
      finally { setChangingPw(false); }
   };

   // Calculate password strength
   const getPasswordStrength = (pw: string): { level: number; label: string; color: string } => {
      if (!pw) return { level: 0, label: '', color: '' };
      let score = 0;
      if (pw.length >= 6) score++;
      if (pw.length >= 10) score++;
      if (/[A-Z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
      if (score <= 3) return { level: 2, label: 'Medium', color: 'bg-amber-500' };
      return { level: 3, label: 'Strong', color: 'bg-green-500' };
   };

   const pwStrength = getPasswordStrength(newPw);

   return (
      <div className="p-8 max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
         {/* Page Header */}
         <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tight">Settings</h1>
            <p className="text-sm text-slate-400 font-bold mt-1">Manage your account preferences and environment.</p>
         </div>

         {/* Settings Navigation */}
         <div className="space-y-6">

            {/* Appearance */}
            <SettingsSection icon="palette" title="Appearance" description="Customize how Dominate looks and feels.">
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div>
                     <p className="text-sm font-bold">Theme</p>
                     <p className="text-xs text-slate-400 font-medium">Switch between light and dark mode</p>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                     <button onClick={darkMode ? toggleTheme : undefined}
                        className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${!darkMode ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        <span className="material-icons-outlined text-sm">light_mode</span> Light
                     </button>
                     <button onClick={!darkMode ? toggleTheme : undefined}
                        className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${darkMode ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-slate-400 hover:text-slate-600'}`}>
                        <span className="material-icons-outlined text-sm">dark_mode</span> Dark
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Language</p>
                     <select value={language} onChange={e => setLanguage(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-primary transition-colors">
                        <option>English</option>
                        <option>中文</option>
                        <option>日本語</option>
                        <option>한국어</option>
                     </select>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Timezone</p>
                     <select value={timezone} onChange={e => setTimezone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-primary transition-colors">
                        <option>UTC+8</option>
                        <option>UTC+0</option>
                        <option>UTC-5</option>
                        <option>UTC-8</option>
                        <option>UTC+9</option>
                     </select>
                  </div>
               </div>
            </SettingsSection>

            {/* Notifications */}
            <SettingsSection icon="notifications" title="Notifications" description="Control when and how you receive alerts.">
               <div className="space-y-1">
                  <ToggleRow label="Email Summary" description="Daily digest of upcoming deadlines" icon="email" enabled={emailSummary} onToggle={() => setEmailSummary(!emailSummary)} />
                  <ToggleRow label="Push Alerts" description="Instant updates on task mentions" icon="notifications_active" enabled={pushAlerts} onToggle={() => setPushAlerts(!pushAlerts)} />
                  <ToggleRow label="Task Reminders" description="Get reminded 1 hour before deadlines" icon="alarm" enabled={taskReminders} onToggle={() => setTaskReminders(!taskReminders)} />
                  <ToggleRow label="Weekly Digest" description="Summary of your team's activity each week" icon="summarize" enabled={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} />
               </div>
            </SettingsSection>

            {/* Security */}
            <SettingsSection icon="shield" title="Security" description="Manage your password and authentication.">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Current Password</label>
                        <div className="relative">
                           <input type={showOldPw ? 'text' : 'password'} value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="Enter current password"
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-primary transition-colors pr-10" />
                           <button onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                              <span className="material-icons-outlined text-lg">{showOldPw ? 'visibility_off' : 'visibility'}</span>
                           </button>
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Password</label>
                        <div className="relative">
                           <input type={showNewPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 characters"
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-primary transition-colors pr-10" />
                           <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                              <span className="material-icons-outlined text-lg">{showNewPw ? 'visibility_off' : 'visibility'}</span>
                           </button>
                        </div>
                        {newPw && (
                           <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                                 {[1, 2, 3].map(i => (
                                    <div key={i} className={`flex-1 rounded-full transition-colors ${i <= pwStrength.level ? pwStrength.color : 'bg-transparent'}`} />
                                 ))}
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${pwStrength.level === 1 ? 'text-red-500' : pwStrength.level === 2 ? 'text-amber-500' : 'text-green-500'}`}>{pwStrength.label}</span>
                           </div>
                        )}
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Confirm New Password</label>
                        <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password"
                           className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm font-medium outline-none transition-colors ${confirmPw && confirmPw !== newPw ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary'}`} />
                        {confirmPw && confirmPw !== newPw && (
                           <p className="text-[10px] text-red-500 font-bold mt-1">Passwords don't match</p>
                        )}
                     </div>
                     {pwStatus && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${pwStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-green-50 dark:bg-green-900/20 text-green-500'}`}>
                           <span className="material-icons-outlined text-sm">{pwStatus.type === 'error' ? 'error' : 'check_circle'}</span>
                           {pwStatus.msg}
                        </div>
                     )}
                     <button onClick={handleChangePassword} disabled={changingPw || !oldPw || !newPw || !confirmPw || newPw !== confirmPw}
                        className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 flex items-center gap-2">
                        <span className="material-icons-outlined text-sm">lock</span>
                        {changingPw ? 'Updating...' : 'Update Password'}
                     </button>
                  </div>

                  {/* Security Tips */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                     <h4 className="text-sm font-black mb-4 flex items-center gap-2">
                        <span className="material-icons-outlined text-primary text-lg">tips_and_updates</span>
                        Password Tips
                     </h4>
                     <ul className="space-y-3">
                        {[
                           { text: 'Use at least 6 characters', check: newPw.length >= 6 },
                           { text: 'Include uppercase letters', check: /[A-Z]/.test(newPw) },
                           { text: 'Include numbers', check: /[0-9]/.test(newPw) },
                           { text: 'Include special characters', check: /[^A-Za-z0-9]/.test(newPw) },
                        ].map(tip => (
                           <li key={tip.text} className="flex items-center gap-2 text-xs">
                              <span className={`material-icons-outlined text-sm ${tip.check ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}`}>
                                 {tip.check ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                              <span className={`font-bold ${tip.check ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>{tip.text}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </SettingsSection>

            {/* Danger Zone */}
            {onLogout && (
               <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-red-200 dark:border-red-900/30 shadow-sm">
                  <div className="flex items-start gap-4">
                     <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                        <span className="material-icons-outlined text-red-500">warning</span>
                     </span>
                     <div className="flex-1">
                        <h3 className="text-lg font-black text-red-500 mb-1">Danger Zone</h3>
                        <p className="text-xs text-slate-400 font-bold mb-4">Sign out of your account. You will need to log in again.</p>
                        <button
                           onClick={onLogout}
                           className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                           <span className="material-icons-outlined text-sm">logout</span>
                           Sign Out
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

function SettingsSection({ icon, title, description, children }: { icon: string; title: string; description: string; children: React.ReactNode }) {
   return (
      <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
               <span className="material-icons-outlined text-primary text-lg">{icon}</span>
            </span>
            <div>
               <h3 className="text-lg font-black tracking-tight">{title}</h3>
               <p className="text-xs text-slate-400 font-medium">{description}</p>
            </div>
         </div>
         {children}
      </div>
   );
}

function ToggleRow({ label, description, icon, enabled, onToggle }: { label: string; description: string; icon: string; enabled: boolean; onToggle: () => void }) {
   return (
      <div className="flex justify-between items-center p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
               <span className="material-icons-outlined text-base text-slate-400">{icon}</span>
            </div>
            <div>
               <p className="text-sm font-bold">{label}</p>
               <p className="text-[11px] text-slate-400 font-medium">{description}</p>
            </div>
         </div>
         <button
            onClick={onToggle}
            className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}
         >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`}></div>
         </button>
      </div>
   );
}

export default Settings;
