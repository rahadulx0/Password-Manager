import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Trash2, Star, Wand2 } from 'lucide-react';
import PasswordGenerator from './PasswordGenerator';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'social', label: 'Social', icon: '🌐' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'finance', label: 'Finance', icon: '🏦' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎮' },
  { value: 'other', label: 'Other', icon: '🔑' },
];

export default function PasswordModal({ entry, onClose, onSave, onDelete, onToggleFavorite }) {
  const isEdit = !!entry?.id;
  const [form, setForm] = useState({
    title: '',
    website: '',
    username: '',
    password: '',
    notes: '',
    category: 'other',
  });
  const [showPw, setShowPw] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (entry) {
      setForm({
        title: entry.title || '',
        website: entry.website || '',
        username: entry.username || '',
        password: entry.password || '',
        notes: entry.notes || '',
        category: entry.category || 'other',
      });
    }
  }, [entry]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.password.trim()) {
      toast.error('Title and password are required');
      return;
    }
    setSaving(true);
    try {
      await onSave(form, entry?.id);
      toast.success(isEdit ? 'Updated!' : 'Saved!');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      await onDelete(entry.id);
      toast.success('Deleted');
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#1c1c1e] sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-t-2xl">
          <button onClick={onClose} className="text-primary-600 dark:text-primary-400 font-medium text-sm">
            Cancel
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Password' : 'Add Password'}
          </h2>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="text-primary-600 dark:text-primary-400 font-semibold text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Google Account"
              className="input-field"
              required
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="e.g. google.com"
              className="input-field"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Username / Email</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="e.g. user@example.com"
              className="input-field"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter password"
                className="input-field pr-20"
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerator(!showGenerator)}
                  className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${showGenerator ? 'text-primary-600' : 'text-gray-400'}`}
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Password Generator */}
          {showGenerator && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-scale-in">
              <PasswordGenerator
                onUse={(pw) => {
                  handleChange('password', pw);
                  setShowGenerator(false);
                  setShowPw(true);
                }}
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleChange('category', cat.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all
                    ${form.category === cat.value
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-500/30'
                      : 'bg-gray-50 dark:bg-white/5 text-gray-500 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="truncate w-full text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Footer actions for edit mode */}
          {isEdit && (
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => onToggleFavorite(entry.id)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-all
                  ${entry.favorite
                    ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 border border-yellow-200 dark:border-yellow-500/20'
                    : 'bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'
                  }`}
              >
                <Star className={`w-4 h-4 ${entry.favorite ? 'fill-yellow-500' : ''}`} />
                <span className="text-sm">{entry.favorite ? 'Favorited' : 'Favorite'}</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                  ${confirmDelete
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                  }`}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">{confirmDelete ? 'Confirm' : 'Delete'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
