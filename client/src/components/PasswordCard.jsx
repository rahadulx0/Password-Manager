import { useState, useMemo } from 'react';
import { Copy, Star, ExternalLink, Check, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getIconComponent } from '../utils/categoryIcons';
import toast from 'react-hot-toast';

const COLOR_PALETTE = [
  { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  { bg: 'bg-pink-100 dark:bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  { bg: 'bg-teal-100 dark:bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400' },
  { bg: 'bg-indigo-100 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
  { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
  { bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
];

const FALLBACK = { bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', icon: 'Key' };

export default function PasswordCard({ entry, onEdit, onToggleFavorite, selectMode, isSelected, onToggleSelect }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const cat = useMemo(() => {
    const categories = user?.categories || [];
    const idx = categories.findIndex((c) => c.value === entry.category);
    if (idx === -1) return FALLBACK;
    const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
    return { ...color, icon: categories[idx].icon };
  }, [user?.categories, entry.category]);

  const CatIcon = getIconComponent(cat.icon);

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
      className={`glass-card rounded-2xl py-3 px-5 hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in active:scale-[0.98] ${
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
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${favicon && !faviconError ? 'bg-gray-100 dark:bg-white/5' : 'bg-primary-100 dark:bg-primary-500/10'}`}>
          {favicon && !faviconError ? (
            <img src={favicon} alt="" className="w-6 h-6 rounded" onError={() => setFaviconError(true)} />
          ) : (
            <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          )}
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
        {!selectMode && <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={copyPassword}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-90 transition-all"
            title="Copy password"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>}
      </div>
    </div>
  );
}
