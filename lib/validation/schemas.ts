import { z } from 'zod';

const MAX_NAME    = 200;
const MAX_TEXT    = 500;
const MAX_NOTES   = 1000;
const MAX_LOGO    = 2_800_000; // ~2 MB em base64

// ─── Products ──────────────────────────────────────────────────────────────
export const createProductSchema = z.object({
  name:     z.string().min(1, 'Nome é obrigatório').max(MAX_NAME),
  price:    z.number().nonnegative('Preço inválido'),
  barcode:  z.string().max(50).optional().default(''),
  stock:    z.number().int().nonnegative('Estoque inválido').default(0),
  minStock: z.number().int().nonnegative('Estoque mínimo inválido').default(0),
  category: z.string().max(100).optional().default(''),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name:     z.string().min(1, 'Nome é obrigatório').max(MAX_NAME).optional(),
  price:    z.number().nonnegative('Preço inválido').optional(),
  barcode:  z.string().max(50).optional(),
  stock:    z.number().int().nonnegative().optional(),
  minStock: z.number().int().nonnegative().optional(),
  category: z.string().max(100).optional(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ─── Customers ─────────────────────────────────────────────────────────────
export const createCustomerSchema = z.object({
  name:    z.string().min(1, 'Nome é obrigatório').max(MAX_NAME),
  phone:   z.string().max(20).nullable().optional(),
  email:   z.string().max(MAX_NAME).nullable().optional(),
  cpf:     z.string().max(20).nullable().optional(),
  address: z.string().max(MAX_TEXT).nullable().optional(),
  notes:   z.string().max(MAX_NOTES).nullable().optional(),
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

// ─── Sales ─────────────────────────────────────────────────────────────────
const saleItemInputSchema = z.object({
  productId: z.string().min(1).max(50),
  quantity:  z.number().int().positive('Quantidade deve ser > 0').max(9_999),
});

export const createSaleSchema = z.object({
  items:         z.array(saleItemInputSchema).min(1, 'A venda deve ter ao menos um item').max(200),
  paymentMethod: z.string().min(1, 'Método de pagamento é obrigatório').max(50),
  customerName:  z.string().max(MAX_NAME).nullable().optional(),
  customerPhone: z.string().max(20).nullable().optional(),
  dueDate:       z.string().nullable().optional(),
  customerId:    z.string().nullable().optional(),
});
export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export const updateSaleSchema = z.object({
  paidAt:        z.string().nullable().optional(),
  dueDate:       z.string().nullable().optional(),
  customerName:  z.string().max(MAX_NAME).nullable().optional(),
  customerPhone: z.string().max(20).nullable().optional(),
  paymentMethod: z.string().min(1).max(50).optional(),
});
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;

// ─── Store ─────────────────────────────────────────────────────────────────
export const createStoreSchema = z.object({
  name:    z.string().min(1, 'Nome é obrigatório').max(MAX_NAME),
  cpf:     z.string().min(11, 'CPF/CNPJ inválido').max(20),
  phone:   z.string().max(20).optional().default(''),
  address: z.string().max(MAX_TEXT).optional().default(''),
});
export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const updateStoreSchema = z.object({
  name:    z.string().min(1, 'Nome é obrigatório').max(MAX_NAME).optional(),
  phone:   z.string().max(20).nullable().optional(),
  address: z.string().max(MAX_TEXT).nullable().optional(),
  logo:    z.string()
             .max(MAX_LOGO, 'Logo muito grande (máx 2 MB)')
             .refine(
               (v) => v.startsWith('data:image/') || v.startsWith('https://') || v.startsWith('http://'),
               'Logo deve ser uma URL válida ou imagem em base64',
             )
             .nullable()
             .optional(),
});
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;

// ─── Helper ────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

export async function parseBody<T>(
  req: NextRequest,
  schema: z.ZodType<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      data: null,
      error: NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 }),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Dados inválidos.';
    return { data: null, error: NextResponse.json({ error: message }, { status: 400 }) };
  }

  return { data: result.data, error: null };
}
