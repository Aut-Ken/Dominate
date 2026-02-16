
import React, { useState } from 'react';

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
  onJoin: (code: string) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onCreate, onJoin }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    if (activeTab === 'create') {
      onCreate(inputValue);
    } else {
      onJoin(inputValue);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Project</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4 flex gap-2 bg-slate-50/50 dark:bg-slate-900/30">
          <button 
            onClick={() => { setActiveTab('create'); setInputValue(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'create' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'
            }`}
          >
            Create New
          </button>
          <button 
            onClick={() => { setActiveTab('join'); setInputValue(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'join' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'
            }`}
          >
            Join Project
          </button>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              {activeTab === 'create' ? 'Project Name' : 'Secret Invitation Key'}
            </label>
            <input 
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              type="text" 
              placeholder={activeTab === 'create' ? "e.g. Apollo Mission" : "Enter 6-digit key..."}
              className="w-full px-4 py-4 rounded-2xl border-none bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center text-lg font-bold placeholder:font-normal"
            />
            {activeTab === 'join' && (
              <p className="text-[10px] text-slate-500 text-center">Received a key from your team? Enter it above to join instantly.</p>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-primary hover:bg-primary-dark shadow-xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            >
              {activeTab === 'create' ? 'Create Project' : 'Join Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
