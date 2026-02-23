import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [lockTimeout, setLockTimeoutState] = useState(() => {
    const saved = localStorage.getItem('lockTimeout');
    return saved !== null ? Number(saved) : 15;
  });

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function fetchUser() {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }

  function login(newToken, userData) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setLocked(false);
  }

  function updateUser(userData) {
    setUser(userData);
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLocked(false);
  }, []);

  const lock = useCallback(() => {
    setLocked(true);
  }, []);

  const unlock = useCallback(() => {
    setLocked(false);
  }, []);

  function setLockTimeout(minutes) {
    setLockTimeoutState(minutes);
    localStorage.setItem('lockTimeout', String(minutes));
  }

  // Auto-lock after configured minutes of inactivity (0 = never)
  useEffect(() => {
    if (!token || lockTimeout === 0) return;

    const TIMEOUT = lockTimeout * 60 * 1000;
    let timer;

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        lock();
        toast('Locked due to inactivity');
      }, TIMEOUT);
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [token, lockTimeout, lock]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, fetchUser, updateUser, locked, lock, unlock, lockTimeout, setLockTimeout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
