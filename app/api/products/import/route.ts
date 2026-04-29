import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { createProductSchema } from '@/lib/validation/schemas';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS       = 1_000;

const COL: Record<string, string> = {
  nome: 'name', name: 'name',
  'código de barras': 'barcode', 'codigo de barras': 'barcode',
  barcode: 'barcode', código: 'barcode', codigo: 'barcode',
  'cód. barras': 'barcode', 'cod. barras': 'barcode',
  categoria: 'category', category: 'category',
  'preço': 'price', preco: 'price', price: 'price', valor: 'price',
  estoque: 'stock', stock: 'stock', quantidade: 'stock', qty: 'stock',
  'estoque mínimo': 'minStock', 'estoque minimo': 'minStock',
  'min. estoque': 'minStock', minstock: 'minStock', 'estoque min': 'minStock',
};

function cellStr(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return '';
  if (typeof v === 'object' && 'richText' in v) {
    return (v as ExcelJS.CellRichTextValue).richText.map((r) => r.text).join('');
  }
  return String(v);
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  // ── Parse multipart ──────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Envie o arquivo como multipart/form-data.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5 MB.' }, { status: 413 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !['xlsx', 'xls'].includes(ext)) {
    return NextResponse.json({ error: 'Formato inválido. Envie um arquivo .xlsx ou .xls.' }, { status: 415 });
  }

  // ── Parse with exceljs (server-side only — no xlsx CVEs) ─────────────────
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(arrayBuffer);
  } catch {
    return NextResponse.json({ error: 'Não foi possível ler o arquivo. Certifique-se de que é um Excel válido.' }, { status: 422 });
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return NextResponse.json({ error: 'Planilha vazia ou inválida.' }, { status: 422 });
  }

  // ── Map header row ────────────────────────────────────────────────────────
  const headerRow  = worksheet.getRow(1);
  const colMap: Record<number, string> = {};
  headerRow.eachCell((cell, colNum) => {
    const key = cellStr(cell).toLowerCase().trim();
    const mapped = COL[key];
    if (mapped) colMap[colNum] = mapped;
  });

  if (!Object.values(colMap).includes('name')) {
    return NextResponse.json({
      error: 'Coluna "Nome" não encontrada. Use o modelo disponível para download.',
    }, { status: 422 });
  }

  // ── Parse data rows ───────────────────────────────────────────────────────
  const products: z.infer<typeof createProductSchema>[] = [];
  const parseErrors: string[] = [];

  worksheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    if (products.length >= MAX_ROWS) return;

    const raw: Record<string, unknown> = {};
    row.eachCell((cell, colNum) => {
      const field = colMap[colNum];
      if (field) raw[field] = cellStr(cell);
    });

    const name = String(raw.name ?? '').trim();
    if (!name) {
      parseErrors.push(`Linha ${rowNum}: Nome é obrigatório`);
      return;
    }

    const rawPrice = String(raw.price ?? '0').replace(',', '.').replace(/[^0-9.]/g, '');
    const price = parseFloat(rawPrice);
    if (isNaN(price) || price < 0) {
      parseErrors.push(`Linha ${rowNum}: Preço inválido`);
      return;
    }

    const validated = createProductSchema.safeParse({
      name,
      barcode:  String(raw.barcode  ?? '').trim(),
      category: String(raw.category ?? '').trim(),
      price,
      stock:    parseInt(String(raw.stock    ?? '0'), 10) || 0,
      minStock: parseInt(String(raw.minStock ?? '0'), 10) || 0,
    });

    if (!validated.success) {
      parseErrors.push(`Linha ${rowNum}: ${validated.error.issues[0]?.message ?? 'Dado inválido'}`);
      return;
    }

    products.push(validated.data);
  });

  if (products.length === 0) {
    return NextResponse.json({
      error: parseErrors.length > 0
        ? `Nenhum produto válido. Erros: ${parseErrors.slice(0, 3).join(' | ')}`
        : 'Nenhum produto encontrado na planilha.',
    }, { status: 422 });
  }

  // ── Insert ────────────────────────────────────────────────────────────────
  try {
    const result = await prisma.product.createMany({
      data: products.map((p) => ({
        name:     p.name,
        price:    p.price,
        barcode:  p.barcode ?? '',
        stock:    p.stock,
        minStock: p.minStock,
        category: p.category ?? '',
        storeId:  auth.storeId,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      created:     result.count,
      parseErrors: parseErrors.length > 0 ? parseErrors : undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar produtos.' }, { status: 500 });
  }
}
