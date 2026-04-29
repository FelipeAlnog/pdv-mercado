import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const products = await prisma.product.findMany({
      where: { storeId: auth.storeId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produtos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const data = await req.json();
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório.' }, { status: 400 });
    }
    const product = await prisma.product.create({ data: { ...data, storeId: auth.storeId } });
    return NextResponse.json(product, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Código de barras já cadastrado.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro ao criar produto.' }, { status: 500 });
  }
}
