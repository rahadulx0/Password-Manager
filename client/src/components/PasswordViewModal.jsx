import { useState } from 'react';
import { X, Copy, Eye, EyeOff, Edit2, Trash2, Check, Globe, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

export default function PasswordViewModal({ entry, onClose, onEdit, onDelete }) {
  const [showPw, setShowPw] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!entry) return null;

  function copyToClipboard(text, isPassword) {
    navigator.clipboard.writeText(text);
    if (isPassword) {
      setCopiedPw(true);
      setTimeout(() => setCopiedPw(false), 2000);
      toast.success('Password copied!');
    } else {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
      toast.success('Username copied!');
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      toast.success('Password deleted');
      onClose();
    } catch (error) {
      toast.error('Failed to delete password');
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
              {entry.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Username Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Username
              </label>
              <div className="flex gap-2 min-w-0">
                <div className="flex-1 min-w-0 flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="flex-1 min-w-0 text-sm font-mono text-gray-700 dark:text-gray-300 truncate select-all">
                    {entry.username || 'No username'}
                  </span>
                </div>
                {entry.username && (
                  <button
                    onClick={() => copyToClipboard(entry.username, false)}
                    className="shrink-0 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 transition-colors"
                    title="Copy Username"
                  >
                    {copiedUser ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Password
              </label>
              <div className="flex gap-2 min-w-0">
                <div className="flex-1 min-w-0 flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 overflow-hidden">
                   <button
                    onClick={() => setShowPw(!showPw)}
                    className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="flex-1 min-w-0 text-sm font-mono text-gray-700 dark:text-gray-300 truncate select-all">
                    {showPw ? entry.password : '••••••••••••'}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(entry.password, true)}
                  className="shrink-0 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 transition-colors"
                  title="Copy Password"
                >
                  {copiedPw ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Website Link (Optional but nice) */}
             {entry.website && (
              <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                <Globe className="w-4 h-4 shrink-0" />
                <a
                    href={entry.website.startsWith('http') ? entry.website : `https://${entry.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                >
                    {entry.website}
                </a>
              </div>
            )}

            {/* Last Modified */}
            {entry.updatedAt && (
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Last modified {new Date(entry.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
            <button
              onClick={() => onEdit(entry)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Password"
          message="Are you sure you want to delete this password? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
