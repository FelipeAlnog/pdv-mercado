/**
 * Limpa todos os stores Zustand da sessão atual.
 *
 * SEGURANÇA / LGPD: deve ser chamado em TODA troca de usuário (logout, expiração de sessão)
 * para garantir que nenhum dado de uma loja/conta seja visível para outra sessão no mesmo browser.
 */

import { useProductStore } from './useProductStore';
import { useSaleStore } from './useSaleStore';
import { useCustomerStore } from './useCustomerStore';
import { useStoreStore } from './useStoreStore';
import { useCartStore } from './useCartStore';

export function resetAllStores() {
  useProductStore.getState().reset();
  useSaleStore.getState().reset();
  useCustomerStore.getState().reset();
  useStoreStore.getState().reset();
  useCartStore.getState().clearCart();
}
