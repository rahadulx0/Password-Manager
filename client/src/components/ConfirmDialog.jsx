export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, variant, loading, onConfirm, onCancel }) {
  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-[270px] bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="px-4 pt-5 pb-4 text-center">
          <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white mb-0.5">{title}</h3>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-snug">{message}</p>
        </div>
        <div className="flex border-t border-gray-200 dark:border-white/10">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-[11px] text-[17px] font-normal text-primary-600 dark:text-primary-400 active:bg-gray-100 dark:active:bg-white/5 transition-colors border-r border-gray-200 dark:border-white/10 disabled:opacity-50"
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-[11px] text-[17px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center ${
              isDanger
                ? 'text-red-500 active:bg-red-50 dark:active:bg-red-500/10'
                : 'text-primary-600 dark:text-primary-400 active:bg-primary-50 dark:active:bg-primary-500/10'
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
