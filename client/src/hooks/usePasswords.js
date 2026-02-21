import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePasswords() {
  const { token } = useAuth();
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchPasswords = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'all') params.set('category', category);
      if (showFavorites) params.set('favorite', 'true');

      const res = await fetch(`/api/passwords?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPasswords(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token, search, category, showFavorites]);

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  async function addPassword(data) {
    const res = await fetch('/api/passwords', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    const newEntry = await res.json();
    setPasswords((prev) => [newEntry, ...prev]);
    return newEntry;
  }

  async function updatePassword(id, data) {
    const res = await fetch(`/api/passwords/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    const updated = await res.json();
    setPasswords((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async function deletePassword(id) {
    const res = await fetch(`/api/passwords/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    setPasswords((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleFavorite(id) {
    const res = await fetch(`/api/passwords/${id}/favorite`, {
      method: 'PATCH',
      headers,
    });
    if (!res.ok) return;
    const { favorite } = await res.json();
    setPasswords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite } : p))
    );
  }

  return {
    passwords,
    loading,
    search,
    setSearch,
    category,
    setCategory,
    showFavorites,
    setShowFavorites,
    addPassword,
    updatePassword,
    deletePassword,
    toggleFavorite,
    refresh: fetchPasswords,
  };
}
