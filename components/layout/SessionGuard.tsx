'use client';

/**
 * SessionGuard — Proteção de isolamento multi-tenant (LGPD).
 *
 * Monitora a sessão ativa. Se o userId mudar (logout + login de outro usuário
 * na mesma aba), limpa TODOS os stores Zustand imediatamente, garantindo que
 * nenhum dado de uma loja/conta vaze para outra sessão no mesmo browser.
 */

import { useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { resetAllStores } from '@/store/resetAllStores';

export function SessionGuard() {
  const { data: session, isPending } = useSession();
  const prevUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (isPending) return;

    const currentId = session?.user?.id ?? null;

    // Primeira renderização — apenas registra o userId inicial, não reseta
    if (prevUserId.current === undefined) {
      prevUserId.current = currentId;
      return;
    }

    // Usuário mudou (incluindo logout → login de outra conta)
    if (prevUserId.current !== currentId) {
      resetAllStores();
      prevUserId.current = currentId;
    }
  }, [session?.user?.id, isPending]);

  return null;
}
