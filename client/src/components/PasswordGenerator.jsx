import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Copy, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const OPTION_LABELS = {
  uppercase: 'A-Z',
  lowercase: 'a-z',
  numbers: '0-9',
  symbols: '#$%',
};

function getStrength(pw, options) {
  if (!pw) return { label: '', percent: 0, color: 'bg-gray-300 dark:bg-gray-600' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 20) score++;
  if (pw.length >= 32) score++;
  const activeOpts = Object.values(options).filter(Boolean).length;
  if (activeOpts >= 2) score++;
  if (activeOpts >= 3) score++;
  if (activeOpts >= 4) score++;

  if (score <= 2) return { label: 'Weak', percent: 25, color: 'bg-red-500' };
  if (score <= 4) return { label: 'Fair', percent: 50, color: 'bg-orange-500' };
  if (score <= 5) return { label: 'Strong', percent: 75, color: 'bg-yellow-500' };
  return { label: 'Very Strong', percent: 100, color: 'bg-green-500' };
}

function colorChar(ch) {
  if (/[A-Z]/.test(ch)) return 'text-primary-600 dark:text-primary-400';
  if (/[a-z]/.test(ch)) return 'text-gray-800 dark:text-gray-200';
  if (/[0-9]/.test(ch)) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

export default function PasswordGenerator({ onUse, compact = false }) {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let chars = '';
    Object.entries(options).forEach(([key, enabled]) => {
      if (enabled) chars += CHARSETS[key];
    });
    if (!chars) chars = CHARSETS.lowercase;

    let pw = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      pw += chars[array[i] % chars.length];
    }
    setGenerated(pw);
    setCopied(false);
  }, [length, options]);

  // Generate on mount and when options/length change
  useEffect(() => {
    generate();
  }, [generate]);

  function copyToClipboard() {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  const strength = getStrength(generated, options);

  return (
    <div className="space-y-4">
      {/* Generated password display */}
      <div className="relative group">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 min-h-[3.5rem] flex items-center">
          <div className="flex-1 min-w-0 pr-16">
            <code className={`${compact ? 'text-sm' : 'text-base'} font-mono break-all select-all leading-relaxed`}>
              {generated.split('').map((ch, i) => (
                <span key={i} className={colorChar(ch)}>{ch}</span>
              ))}
            </code>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              onClick={generate}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!generated}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Strength bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <span className={`text-xs font-semibold shrink-0 ${
            strength.percent <= 25 ? 'text-red-500' :
            strength.percent <= 50 ? 'text-orange-500' :
            strength.percent <= 75 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-green-500'
          }`}>
            {strength.label}
          </span>
        </div>
      </div>

      {/* Length slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Length</label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLength((l) => Math.max(4, l - 1))}
              className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-colors"
            >
              −
            </button>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400 w-7 text-center tabular-nums">{length}</span>
            <button
              onClick={() => setLength((l) => Math.min(64, l + 1))}
              className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-primary-600 h-1.5 cursor-pointer"
        />
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] text-gray-400">4</span>
          <span className="text-[10px] text-gray-400">64</span>
        </div>
      </div>

      {/* Character options */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-4'} gap-1.5`}>
        {Object.entries(options).map(([key, enabled]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              const activeCount = Object.values(options).filter(Boolean).length;
              if (enabled && activeCount <= 1) return;
              setOptions((o) => ({ ...o, [key]: !o[key] }));
            }}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all
              ${enabled
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-500/20'
                : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/10'
              }`}
          >
            <span className="text-sm">{OPTION_LABELS[key]}</span>
            <span className={`text-[10px] capitalize ${enabled ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>{key}</span>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      {onUse ? (
        <div className="flex gap-2">
          <button
            onClick={generate}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <button
            onClick={() => onUse(generated)}
            disabled={!generated}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
          >
            <Zap className="w-4 h-4" />
            Use
          </button>
        </div>
      ) : !compact ? (
        <button
          onClick={copyToClipboard}
          disabled={!generated}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Password'}
        </button>
      ) : null}
    </div>
  );
}
