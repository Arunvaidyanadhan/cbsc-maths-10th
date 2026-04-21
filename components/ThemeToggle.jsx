'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
      setIsLight(true);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isLight ? 'dark' : 'light';
    setIsLight(!isLight);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 bg-surface-2 border border-border text-text-muted font-mono text-xs tracking-widest uppercase px-4 py-2 cursor-pointer transition-all hover:text-accent hover:border-accent"
      aria-label="Toggle theme"
    >
      <span className={`text-lg transition-transform duration-300 ${isLight ? 'rotate-180' : ''}`}>
        ☀
      </span>
      <span>{isLight ? 'Dark' : 'Light'}</span>
    </button>
  );
}
