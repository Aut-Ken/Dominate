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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isRegister) {
                await api.register(username, password, name);
                // Auto login after register or ask user to login
                const data = await api.login(username, password);
                onLogin(data.token, data.user_id);
            } else {
                const data = await api.login(username, password);
                if (data.token) {
                    onLogin(data.token, data.user_id);
                } else {
                    setError('Login failed');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-background-dark text-slate-100">
            <div className="bg-surface-dark p-8 rounded-xl shadow-2xl w-96 border border-border-dark">
                <h2 className="text-2xl font-bold mb-6 text-primary-400">
                    {isRegister ? 'Join Dominate' : 'Welcome Back'}
                </h2>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-background-dark border border-border-dark rounded p-2 text-slate-100 focus:border-primary-500 focus:outline-none"
                            required
                        />
                    </div>

                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-background-dark border border-border-dark rounded p-2 text-slate-100 focus:border-primary-500 focus:outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background-dark border border-border-dark rounded p-2 text-slate-100 focus:border-primary-500 focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                        {isRegister ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-slate-500">
                    {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                    >
                        {isRegister ? 'Log in' : 'Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
