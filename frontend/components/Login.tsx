import React, { useState } from 'react';
import { api } from '../services/api';

interface LoginProps {
    onLogin: (token: string, userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await api.register(username, password, name);
                const data = await api.login(username, password);
                onLogin(data.token, data.user_id);
            } else {
                const data = await api.login(username, password);
                if (data.token) {
                    onLogin(data.token, data.user_id);
                } else {
                    setError(data.error || 'Login failed. Please check your credentials.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-dark text-slate-100 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-2xl shadow-primary/40 mb-6">
                        <span className="material-icons-outlined text-3xl text-white font-bold">bolt</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        {isRegister ? 'Join Dominate' : 'Welcome Back'}
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">
                        {isRegister ? 'Create your account to get started' : 'Sign in to your workspace'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-surface-dark/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-slate-800/60">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
                            <span className="material-icons-outlined text-lg shrink-0">error_outline</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">person</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-100 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm font-medium placeholder:text-slate-600"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        {isRegister && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Name</label>
                                <div className="relative">
                                    <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">badge</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-100 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm font-medium placeholder:text-slate-600"
                                        placeholder="How should we call you?"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-100 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm font-medium placeholder:text-slate-600"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <span className="material-icons-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-4 px-6 rounded-xl transition-all text-sm uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                isRegister ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-800/50 text-center text-sm text-slate-500">
                        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-primary hover:text-primary/80 transition-colors font-bold"
                        >
                            {isRegister ? 'Sign in' : 'Create one'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-slate-600 mt-8 font-bold uppercase tracking-widest">
                    Powered by Dominate • Project Management
                </p>
            </div>
        </div>
    );
};

export default Login;
