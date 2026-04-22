'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const themeToApply = savedTheme || 'dark';
    setTheme(themeToApply);
    document.documentElement.setAttribute('data-theme', themeToApply);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="dark-toggle flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-subtle text-muted hover:text-heading transition-all"
      aria-label="Toggle theme"
    >
      <span className="text-xl">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
