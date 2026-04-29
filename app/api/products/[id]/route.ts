import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id, storeId: auth.storeId } });
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produto.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id } = await params;
    const { storeId: _, ...data } = await req.json(); // impede troca de storeId
    const product = await prisma.product.update({ where: { id, storeId: auth.storeId }, data });
    return NextResponse.json(product);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Código de barras já cadastrado.' }, { status: 409 });
    }
    if (msg.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar produto.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id, storeId: auth.storeId } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro ao deletar produto.' }, { status: 500 });
  }
}
