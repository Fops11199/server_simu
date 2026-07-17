import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Server, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only digits, max 4 length
    if (/^\d*$/.test(val) && val.length <= 4) {
      setPin(val);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);
    setError(null);

    const action = isLogin ? login : register;
    const result = await action(username, pin);

    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-300 flex items-center justify-center p-4 select-none font-sans relative overflow-hidden">
      
      {/* Dynamic glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Logo / Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/30 items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-4">
            <Server className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white uppercase">HostLab Login</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Interactive Linux Server Admin Sandbox
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-[#0b0b0f]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl shadow-black/80">
          <div className="flex border-b border-white/5 mb-6 pb-2">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                isLogin ? 'border-cyan-500 text-cyan-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                !isLogin ? 'border-cyan-500 text-cyan-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Create Profile
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-xs text-red-400 leading-normal animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin_student"
                  disabled={loading}
                  className="w-full bg-[#07070a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                />
              </div>
            </div>

            {/* PIN Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider flex justify-between">
                <span>4-Digit PIN</span>
                <span className="text-cyan-500/60 lowercase font-normal">(numeric login key)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="••••"
                  disabled={loading}
                  className="w-full bg-[#07070a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white tracking-widest placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono font-bold"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm tracking-wide py-3.5 rounded-xl transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                'Log In to Server'
              ) : (
                'Register & Launch'
              )}
            </button>
          </form>
        </div>

        {/* Security Warning Tip */}
        <div className="text-center mt-6 text-[10px] text-slate-600 font-mono">
          🔒 Profiles are saved to your local PostgreSQL database
        </div>

      </div>
    </div>
  );
};
