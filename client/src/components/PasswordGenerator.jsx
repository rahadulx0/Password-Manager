import { useState, useCallback } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export default function PasswordGenerator({ onUse }) {
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
    if (!chars) {
      chars = CHARSETS.lowercase;
    }

    let pw = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      pw += chars[array[i] % chars.length];
    }
    setGenerated(pw);
    setCopied(false);
  }, [length, options]);

  function copyToClipboard() {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  // Generate on first render
  if (!generated) generate();

  return (
    <div className="space-y-4">
      {/* Generated password display */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
        <code className="flex-1 text-sm font-mono break-all text-gray-900 dark:text-gray-100 select-all">
          {generated || 'Click generate'}
        </code>
        <button
          onClick={copyToClipboard}
          disabled={!generated}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Length slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Length</label>
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-md">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => {
            setLength(Number(e.target.value));
          }}
          className="w-full accent-primary-600"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(options).map(([key, enabled]) => (
          <label
            key={key}
            className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium
              ${enabled
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-500/20'
                : 'bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'
              }`}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => setOptions((o) => ({ ...o, [key]: !o[key] }))}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
              ${enabled ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600'}`}
            >
              {enabled && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="capitalize">{key}</span>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={generate}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Generate
        </button>
        {onUse && (
          <button
            onClick={() => onUse(generated)}
            disabled={!generated}
            className="btn-primary flex-1 text-sm"
          >
            Use Password
          </button>
        )}
      </div>
    </div>
  );
}
