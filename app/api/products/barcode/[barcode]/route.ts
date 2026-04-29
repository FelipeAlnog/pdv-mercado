import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ barcode: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { barcode } = await params;
    const product = await prisma.product.findUnique({
      where: { barcode_storeId: { barcode, storeId: auth.storeId } },
    });
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produto.' }, { status: 500 });
  }
}
