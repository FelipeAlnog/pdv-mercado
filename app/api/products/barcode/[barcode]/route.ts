import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ barcode: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { barcode } = await params;
  const product = await prisma.product.findUnique({
    where: { barcode_storeId: { barcode, storeId: auth.storeId } },
  });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}
