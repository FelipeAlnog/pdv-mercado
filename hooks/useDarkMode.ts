'use client';

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage('pdv_dark_mode', false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(!isDark) };
}
