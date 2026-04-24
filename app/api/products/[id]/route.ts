import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id, storeId: auth.storeId } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  const { storeId: _, ...data } = await req.json(); // impede troca de storeId
  const product = await prisma.product.update({ where: { id, storeId: auth.storeId }, data });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  await prisma.product.delete({ where: { id, storeId: auth.storeId } });
  return new NextResponse(null, { status: 204 });
}
