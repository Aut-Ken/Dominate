
import React from 'react';

interface SettingsProps {
  toggleTheme: () => void;
  darkMode: boolean;
}

const Settings: React.FC<SettingsProps> = ({ toggleTheme, darkMode }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-32">
      <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-12">
        <h1 className="text-4xl font-black tracking-tight">System Settings</h1>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Manage your personal preferences and environment.</p>
      </div>

      <div className="space-y-12">
        <div className="bg-white dark:bg-surface-dark p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-10">
              <div className="space-y-2 text-center sm:text-left">
                 <h3 className="text-2xl font-black tracking-tight">Visual Experience</h3>
                 <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Choose between dark and light themes.</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-[2rem] flex gap-2 border border-slate-200 dark:border-slate-800">
                 <button onClick={darkMode ? toggleTheme : undefined} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${!darkMode ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500'}`}>Light</button>
                 <button onClick={!darkMode ? toggleTheme : undefined} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${darkMode ? 'bg-primary text-white shadow-2xl shadow-primary/40' : 'text-slate-500'}`}>Dark</button>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="text-2xl font-black tracking-tight mb-12">Alerts & Messaging</h3>
           <div className="space-y-10">
              <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest">Email Summary</p>
                    <p className="text-xs text-slate-500 font-bold">A daily digest of upcoming deadlines.</p>
                 </div>
                 <div className="w-14 h-8 bg-primary rounded-full relative cursor-pointer"><div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-lg"></div></div>
              </div>
              <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest">Push Alerts</p>
                    <p className="text-xs text-slate-500 font-bold">Instant updates on task mentions.</p>
                 </div>
                 <div className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full relative cursor-pointer"><div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"></div></div>
              </div>
           </div>
        </div>
        
        <div className="flex justify-end gap-6 pt-10">
           <button className="px-12 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
           <button className="px-12 py-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">Save Config</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
