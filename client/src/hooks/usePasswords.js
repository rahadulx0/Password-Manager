import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePasswords() {
  const { token } = useAuth();
  const [allPasswords, setAllPasswords] = useState([]);
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
      const res = await fetch('/api/passwords', { headers });
      if (res.ok) {
        const data = await res.json();
        setAllPasswords(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  // Client-side filtering
  const passwords = useMemo(() => {
    let filtered = allPasswords;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.username?.toLowerCase().includes(q) ||
          p.website?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q)
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (showFavorites) {
      filtered = filtered.filter((p) => p.favorite);
    }

    return filtered;
  }, [allPasswords, search, category, showFavorites]);

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
    setAllPasswords((prev) => [newEntry, ...prev]);
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
    setAllPasswords((prev) => prev.map((p) => (p.id === id ? updated : p)));
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
    setAllPasswords((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleFavorite(id) {
    const res = await fetch(`/api/passwords/${id}/favorite`, {
      method: 'PATCH',
      headers,
    });
    if (!res.ok) return;
    const { favorite } = await res.json();
    setAllPasswords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite } : p))
    );
  }

  return {
    allPasswords,
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
