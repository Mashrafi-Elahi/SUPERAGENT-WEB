'use client';

import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    window.localStorage.setItem('mfsa-theme', next);
  };

  return <button type="button" onClick={toggleTheme} className={compact ? 'flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white' : 'flex w-full items-center justify-between rounded-xl px-3 py-2 text-white/70 transition-all hover:bg-white/10 hover:text-white'} aria-label="Toggle day and night mode" title="Toggle day and night mode">
    <span className="flex items-center gap-3"><Moon className="theme-light-icon h-4 w-4" /><Sun className="theme-dark-icon h-4 w-4 text-bkash-light" /><span className={compact ? 'sr-only' : 'text-sm font-medium'}>Appearance</span></span>
    {!compact && <span className="text-xs uppercase tracking-wider text-white/35">Day / Night</span>}
  </button>;
}
