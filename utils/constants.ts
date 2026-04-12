export const PRODUCT_CATEGORIES = [
  'Bebidas',
  'Laticínios',
  'Carnes',
  'Padaria',
  'Higiene',
  'Limpeza',
  'Hortifruti',
  'Congelados',
  'Mercearia',
  'Outros',
] as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'card', label: 'Cartão' },
  { value: 'pix', label: 'PIX' },
  { value: 'pending', label: 'A Receber' },
] as const;

export const LOW_STOCK_THRESHOLD = 5;
export const MOCK_DELAY_MS = 300;
