import { useState } from 'react';
import { Eye, EyeOff, Copy, Star, ExternalLink, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  social: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: '🌐' },
  email: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: '📧' },
  finance: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', icon: '🏦' },
  shopping: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', icon: '🛍️' },
  work: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', icon: '💼' },
  entertainment: { bg: 'bg-pink-100 dark:bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', icon: '🎮' },
  other: { bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', icon: '🔑' },
};

export default function PasswordCard({ entry, onEdit, onToggleFavorite, selectMode, isSelected, onToggleSelect }) {
  const [showPw, setShowPw] = useState(false);
  const [copied, setCopied] = useState(false);

  const cat = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other;

  function copyPassword() {
    navigator.clipboard.writeText(entry.password);
    setCopied(true);
    toast.success('Password copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  function getFaviconUrl(website) {
    if (!website) return null;
    try {
      const url = website.startsWith('http') ? website : `https://${website}`;
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  }

  const favicon = getFaviconUrl(entry.website);

  return (
    <div
      className={`glass-card p-4 hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in active:scale-[0.99] ${
        selectMode && isSelected ? 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-500/5' : ''
      }`}
      onClick={() => selectMode ? onToggleSelect(entry.id) : onEdit(entry)}
    >
      <div className="flex items-center gap-3">
        {/* Select checkbox */}
        {selectMode && (
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
            isSelected
              ? 'bg-primary-600 border-primary-600'
              : 'border-gray-300 dark:border-gray-600'
          }`}>
            {isSelected && (
              <Check className="w-3.5 h-3.5 text-white" />
            )}
          </div>
        )}

        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
          {favicon ? (
            <img src={favicon} alt="" className="w-6 h-6 rounded" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          ) : null}
          <span className={`text-lg ${favicon ? 'hidden' : ''}`} style={favicon ? { display: 'none' } : {}}>{cat.icon}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{entry.title}</h3>
            {entry.favorite && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {entry.username || entry.website || 'No details'}
          </p>
        </div>

        {/* Actions */}
        {!selectMode && <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={copyPassword}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Copy password"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowPw(!showPw)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Toggle visibility"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>}
      </div>

      {/* Password preview */}
      {showPw && (
        <div className="mt-3 p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <code className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all select-all">{entry.password}</code>
        </div>
      )}
    </div>
  );
}
