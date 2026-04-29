'use client';

import { useState, useEffect } from 'react';

/**
 * Sempre inicia com initialValue para garantir hydration idêntico entre
 * server e cliente. Após a montagem, sincroniza com o valor do localStorage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Lê do localStorage somente após montar — nunca no SSR
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // ignora erros de parse ou acesso bloqueado
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const next = value instanceof Function ? value(storedValue) : value;
      setStoredValue(next);
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignora erros de quota ou acesso bloqueado
    }
  };

  return [storedValue, setValue] as const;
}
