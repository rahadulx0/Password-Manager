import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const ACCENT_COLORS = {
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
    800: '#1e40af', 900: '#1e3a8a',
  },
  green: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
    400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
    800: '#065f46', 900: '#064e3b',
  },
  pink: {
    50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4',
    400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d',
    800: '#9d174d', 900: '#831843',
  },
};

function applyAccent(name) {
  const palette = ACCENT_COLORS[name] || ACCENT_COLORS.blue;
  const root = document.documentElement;
  for (const [shade, value] of Object.entries(palette)) {
    root.style.setProperty(`--accent-${shade}`, value);
  }
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [accent, setAccentState] = useState(() => {
    return localStorage.getItem('accent') || 'blue';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    applyAccent(accent);
    localStorage.setItem('accent', accent);
  }, [accent]);

  function toggle() {
    setDark((d) => !d);
  }

  function setAccent(name) {
    if (ACCENT_COLORS[name]) {
      setAccentState(name);
    }
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
