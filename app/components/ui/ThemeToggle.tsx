'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const THEME_CHANGE_EVENT = 'mfsa-theme-change';

function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, (): Theme => 'light');

  const setTheme = (next: Theme) => {
    document.documentElement.setAttribute('data-theme', next);
    window.localStorage.setItem('mfsa-theme', next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  if (compact) {
    const next = theme === 'light' ? 'dark' : 'light';
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-bg-border bg-bg-card text-text-secondary shadow-card transition hover:text-text-primary"
        aria-label="Toggle day and night mode"
        title="Toggle day and night mode"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-1" role="group" aria-label="Appearance">
      <div className="grid grid-cols-2 gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-pressed={theme === 'light'}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 transition ${theme === 'light' ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'}`}
        >
          <Sun className="h-3.5 w-3.5" />
          Day
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-pressed={theme === 'dark'}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 transition ${theme === 'dark' ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'}`}
        >
          <Moon className="h-3.5 w-3.5" />
          Night
        </button>
      </div>
    </div>
  );
}
