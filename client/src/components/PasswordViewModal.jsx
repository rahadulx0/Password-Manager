import { useState } from 'react';
import { Copy, Eye, EyeOff, Trash2, Check, Globe, User, Clock } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full sm:max-w-md bg-white dark:bg-[#1c1c1e] sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
          {/* iOS Nav Bar Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-t-2xl">
            <button
              onClick={onClose}
              className="text-primary-600 dark:text-primary-400 font-medium text-[17px] min-w-[60px] text-left"
            >
              Close
            </button>
            <h2 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-gray-900 dark:text-white truncate max-w-[60%] text-center">
              {entry.title}
            </h2>
            <button
              onClick={() => onEdit(entry)}
              className="text-primary-600 dark:text-primary-400 font-semibold text-[17px] min-w-[60px] text-right"
            >
              Edit
            </button>
          </div>

          {/* iOS Grouped Inset List */}
          <div className="p-4">
            <div className="rounded-xl bg-gray-50 dark:bg-white/5 overflow-hidden divide-y divide-gray-200 dark:divide-white/10">
              {/* Username Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                  <p className="text-[15px] text-gray-900 dark:text-white truncate select-all font-mono">
                    {entry.username || 'No username'}
                  </p>
                </div>
                {entry.username && (
                  <button
                    onClick={() => copyToClipboard(entry.username, false)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-90 transition-all"
                    title="Copy Username"
                  >
                    {copiedUser ? <Check className="w-[18px] h-[18px] text-green-500" /> : <Copy className="w-[18px] h-[18px]" />}
                  </button>
                )}
              </div>

              {/* Password Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => setShowPw(!showPw)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Password</p>
                  <p className="text-[15px] text-gray-900 dark:text-white truncate select-all font-mono">
                    {showPw ? entry.password : '••••••••••••'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(entry.password, true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-90 transition-all"
                  title="Copy Password"
                >
                  {copiedPw ? <Check className="w-[18px] h-[18px] text-green-500" /> : <Copy className="w-[18px] h-[18px]" />}
                </button>
              </div>

              {/* Website Row (conditional) */}
              {entry.website && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                    <a
                      href={entry.website.startsWith('http') ? entry.website : `https://${entry.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] text-primary-600 dark:text-primary-400 hover:underline truncate block"
                    >
                      {entry.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Last Modified */}
            {entry.updatedAt && (
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Last modified {new Date(entry.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>

          {/* Footer - Full-width Delete Button */}
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98] transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Password
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
