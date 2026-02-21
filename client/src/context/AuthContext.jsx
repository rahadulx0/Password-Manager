import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

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
  }

  function updateUser(userData) {
    setUser(userData);
  }

  const logout = useCallback((reason) => {
    if (reason === 'inactivity') {
      localStorage.setItem('inactivityLogout', 'true');
    } else {
      localStorage.removeItem('inactivityLogout');
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Auto-logout after 15 minutes of inactivity
  useEffect(() => {
    if (!token) return;

    const TIMEOUT = 15 * 60 * 1000;
    let timer;

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout('inactivity');
        toast('Logged out due to inactivity');
      }, TIMEOUT);
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, fetchUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
