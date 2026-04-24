import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const products = await prisma.product.findMany({
    where: { storeId: auth.storeId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const data = await req.json();
  const product = await prisma.product.create({ data: { ...data, storeId: auth.storeId } });
  return NextResponse.json(product, { status: 201 });
}
