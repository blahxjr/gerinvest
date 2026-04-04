'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('gerinvest-theme') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('gerinvest-theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:scale-[1.02] hover:shadow-xl"
      aria-label="Alternar tema escuro e claro"
    >
      {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
    </button>
  );
}
