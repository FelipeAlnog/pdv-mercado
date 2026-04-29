import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { parseBody, updateProductSchema } from '@/lib/validation/schemas';
import { handlePrismaError } from '@/lib/prisma-errors';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id, storeId: auth.storeId },
    });
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produto.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, updateProductSchema);
  if (bodyError) return bodyError;

  try {
    const { id } = await params;
    const product = await prisma.product.update({
      where: { id, storeId: auth.storeId },
      data: {
        ...(data.name     !== undefined && { name:     data.name }),
        ...(data.price    !== undefined && { price:    data.price }),
        ...(data.barcode  !== undefined && { barcode:  data.barcode }),
        ...(data.stock    !== undefined && { stock:    data.stock }),
        ...(data.minStock !== undefined && { minStock: data.minStock }),
        ...(data.category !== undefined && { category: data.category }),
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    return handlePrismaError(e, 'produto');
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id, storeId: auth.storeId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handlePrismaError(e, 'produto');
  }
}
