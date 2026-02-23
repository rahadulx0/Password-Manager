import { useState } from 'react';
import { Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function LockScreen() {
  const { user, token, unlock, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUnlock(e) {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      unlock();
    } catch (err) {
      toast.error(err.message || 'Incorrect password');
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-[#0a0a0a] px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Avatar & info */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary-600/20">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 mt-1">
              <Lock className="w-3.5 h-3.5" />
              Locked
            </p>
          </div>
        </div>

        {/* Password form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Unlock'
            )}
          </button>
        </form>

        {/* Sign out link */}
        <div className="text-center">
          <button
            onClick={logout}
            className="text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
