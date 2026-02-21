import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, variant, loading, onConfirm, onCancel }) {
  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="p-6 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
            isDanger ? 'bg-red-100 dark:bg-red-500/10' : 'bg-primary-100 dark:bg-primary-500/10'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${isDanger ? 'text-red-500' : 'text-primary-600 dark:text-primary-400'}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <div className="flex border-t border-gray-200 dark:border-white/10">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-r border-gray-200 dark:border-white/10 disabled:opacity-50"
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center ${
              isDanger
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              confirmLabel || 'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
