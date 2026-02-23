import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Copy, Check, Zap, History } from 'lucide-react';
import toast from 'react-hot-toast';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const AMBIGUOUS = '0O1lI';

const OPTION_LABELS = {
  uppercase: 'A-Z',
  lowercase: 'a-z',
  numbers: '0-9',
  symbols: '#$%',
};

const WORD_LIST = [
  'able','acid','aged','also','area','army','away','baby','back','ball',
  'band','bank','base','bath','bear','beat','been','beer','bell','belt',
  'best','bird','bite','blow','blue','boat','body','bomb','bond','bone',
  'book','boot','born','boss','both','burn','busy','cake','call','calm',
  'came','camp','card','care','case','cash','cast','cave','chip','city',
  'claim','clay','clip','club','coal','coat','code','cold','come','cook',
  'cool','cope','copy','core','cost','crew','crop','cross','cure','cute',
  'dare','dark','data','date','dawn','dead','deal','dear','deep','deer',
  'demo','deny','desk','dial','dice','diet','dirt','dish','disk','dock',
  'does','done','door','dose','down','draw','drew','drop','drug','drum',
  'dual','duck','dude','duke','dune','dust','duty','each','earn','ease',
  'east','easy','edge','edit','else','epic','euro','even','ever','evil',
  'exam','exit','face','fact','fade','fail','fair','fake','fall','fame',
  'fang','farm','fast','fate','fear','feed','feel','feet','fell','felt',
  'file','fill','film','find','fine','fire','firm','fish','five','flag',
  'flat','flew','flip','flow','foam','fold','folk','font','food','foot',
  'ford','fore','fork','form','fort','four','free','from','fuel','full',
  'fund','fury','fuse','gain','gale','game','gang','gate','gave','gaze',
  'gear','gene','gift','girl','give','glad','glow','glue','goat','goes',
  'gold','golf','gone','good','grab','gray','grew','grid','grip','grow',
  'gulf','guru','gust','hack','hair','half','hall','halt','hand','hang',
  'hard','harm','hate','have','hawk','haze','head','heap','hear','heat',
  'heel','held','help','herb','here','hero','hide','high','hike','hill',
  'hint','hire','hold','hole','holy','home','hood','hook','hope','horn',
  'host','hour','huge','hull','hung','hunt','hurt','icon','idea','inch',
  'info','iron','isle','item','jack','jade','jail','jake','jazz','jean',
  'jest','joke','jump','june','jury','just','keen','keep','kent','kept',
  'kick','kind','king','kiss','knee','knew','knit','knob','knot','know',
  'lace','lack','lady','laid','lake','lamp','land','lane','last','late',
  'lawn','lazy','lead','leaf','lean','leap','left','lemon','lens','less',
];

const SEPARATORS = [
  { value: '-', label: 'Dash (-)' },
  { value: '.', label: 'Dot (.)' },
  { value: '_', label: 'Underscore (_)' },
  { value: ' ', label: 'Space ( )' },
];

function getStrength(pw, options) {
  if (!pw) return { label: '', level: 0, color: 'bg-gray-300 dark:bg-gray-600' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 20) score++;
  if (pw.length >= 32) score++;
  const activeOpts = Object.values(options).filter(Boolean).length;
  if (activeOpts >= 2) score++;
  if (activeOpts >= 3) score++;
  if (activeOpts >= 4) score++;

  if (score <= 2) return { label: 'Weak', level: 1, color: 'bg-red-500' };
  if (score <= 4) return { label: 'Fair', level: 2, color: 'bg-orange-500' };
  if (score <= 5) return { label: 'Strong', level: 3, color: 'bg-yellow-500' };
  return { label: 'Very Strong', level: 4, color: 'bg-green-500' };
}

function colorChar(ch) {
  if (/[A-Z]/.test(ch)) return 'text-primary-600 dark:text-primary-400';
  if (/[a-z]/.test(ch)) return 'text-gray-800 dark:text-gray-200';
  if (/[0-9]/.test(ch)) return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

export default function PasswordGenerator({ onUse, compact = false }) {
  const [mode, setMode] = useState('random'); // 'random' | 'passphrase'
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Passphrase settings
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');

  const generateRandom = useCallback(() => {
    let chars = '';
    Object.entries(options).forEach(([key, enabled]) => {
      if (enabled) chars += CHARSETS[key];
    });
    if (!chars) chars = CHARSETS.lowercase;

    if (excludeAmbiguous) {
      chars = chars.split('').filter((c) => !AMBIGUOUS.includes(c)).join('');
    }

    let pw = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      pw += chars[array[i] % chars.length];
    }
    return pw;
  }, [length, options, excludeAmbiguous]);

  const generatePassphrase = useCallback(() => {
    const array = new Uint32Array(wordCount + 1);
    crypto.getRandomValues(array);
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(WORD_LIST[array[i] % WORD_LIST.length]);
    }
    // Add a random 2-digit number at the end
    const num = (array[wordCount] % 90) + 10;
    words.push(String(num));
    return words.join(separator);
  }, [wordCount, separator]);

  const generate = useCallback(() => {
    const pw = mode === 'passphrase' ? generatePassphrase() : generateRandom();
    setGenerated(pw);
    setCopied(false);
    setHistory((prev) => {
      const next = [pw, ...prev.filter((p) => p !== pw)];
      return next.slice(0, 5);
    });
  }, [mode, generateRandom, generatePassphrase]);

  // Generate on mount and when settings change
  useEffect(() => {
    generate();
  }, [generate]);

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text || generated);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  function copyHistoryItem(pw) {
    navigator.clipboard.writeText(pw);
    toast.success('Copied!');
  }

  const strength = getStrength(generated, mode === 'passphrase' ? { uppercase: false, lowercase: true, numbers: true, symbols: false } : options);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      {!compact && (
        <div className="flex rounded-full bg-gray-100 dark:bg-white/5 p-1">
          <button
            onClick={() => setMode('random')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${
              mode === 'random'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Random
          </button>
          <button
            onClick={() => setMode('passphrase')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${
              mode === 'passphrase'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Passphrase
          </button>
        </div>
      )}

      {/* Generated password display */}
      <div className="relative group">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 min-h-[4rem] flex items-center">
          <div className="flex-1 min-w-0 pr-16">
            <code className={`${compact ? 'text-sm' : 'text-base lg:text-lg'} font-mono break-all select-all leading-relaxed`}>
              {mode === 'passphrase' ? (
                <span className="text-gray-800 dark:text-gray-200">{generated}</span>
              ) : (
                generated.split('').map((ch, i) => (
                  <span key={i} className={colorChar(ch)}>{ch}</span>
                ))
              )}
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
              onClick={() => copyToClipboard()}
              disabled={!generated}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Segmented strength bar (4 segments) */}
        <div className="mt-2 flex items-center gap-2">
          <div className="strength-segments flex-1">
            {[1, 2, 3, 4].map((seg) => (
              <div
                key={seg}
                className={`segment ${seg <= strength.level ? strength.color : ''}`}
              />
            ))}
          </div>
          <span className={`text-xs font-semibold shrink-0 ${
            strength.level <= 1 ? 'text-red-500' :
            strength.level <= 2 ? 'text-orange-500' :
            strength.level <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-green-500'
          }`}>
            {strength.label}
          </span>
        </div>
      </div>

      {mode === 'random' ? (
        <>
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
              className="ios-slider w-full"
            />
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-gray-400">4</span>
              <span className="text-[10px] text-gray-400">64</span>
            </div>
          </div>

          {/* Character options - pill toggles */}
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
                className={`py-2 px-3 rounded-full text-sm font-semibold transition-all
                  ${enabled
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                  }`}
              >
                {OPTION_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Exclude ambiguous toggle */}
          {!compact && (
            <button
              onClick={() => setExcludeAmbiguous(!excludeAmbiguous)}
              className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 transition-colors"
            >
              <div className="text-left">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Exclude ambiguous</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Remove 0, O, 1, l, I</span>
              </div>
              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${excludeAmbiguous ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${excludeAmbiguous ? 'translate-x-4' : ''}`} />
              </div>
            </button>
          )}
        </>
      ) : (
        <>
          {/* Word count slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Words</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setWordCount((w) => Math.max(3, w - 1))}
                  className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-colors"
                >
                  −
                </button>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400 w-7 text-center tabular-nums">{wordCount}</span>
                <button
                  onClick={() => setWordCount((w) => Math.min(8, w + 1))}
                  className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min={3}
              max={8}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="ios-slider w-full"
            />
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-gray-400">3</span>
              <span className="text-[10px] text-gray-400">8</span>
            </div>
          </div>

          {/* Separator selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Separator</label>
            <div className="grid grid-cols-4 gap-1.5">
              {SEPARATORS.map((sep) => (
                <button
                  key={sep.value}
                  type="button"
                  onClick={() => setSeparator(sep.value)}
                  className={`py-2 px-3 rounded-full text-sm font-semibold transition-all
                    ${separator === sep.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                    }`}
                >
                  {sep.value === ' ' ? '␣' : sep.value}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Action buttons - pill shape */}
      {onUse ? (
        <div className="flex gap-2">
          <button
            onClick={generate}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5 !rounded-full"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <button
            onClick={() => onUse(generated)}
            disabled={!generated}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5 !rounded-full"
          >
            <Zap className="w-4 h-4" />
            Use
          </button>
        </div>
      ) : !compact ? (
        <button
          onClick={() => copyToClipboard()}
          disabled={!generated}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5 !rounded-full"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Password'}
        </button>
      ) : null}

      {/* Password history */}
      {!compact && history.length > 1 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Recent ({history.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1.5 animate-scale-in">
              {history.slice(1).map((pw, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                >
                  <code className="flex-1 min-w-0 text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                    {pw}
                  </code>
                  <button
                    onClick={() => copyHistoryItem(pw)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
