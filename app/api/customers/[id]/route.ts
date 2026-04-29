import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { parseBody, updateCustomerSchema } from '@/lib/validation/schemas';
import { handlePrismaError } from '@/lib/prisma-errors';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id, storeId: auth.storeId },
    });
    if (!customer) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar cliente.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, updateCustomerSchema);
  if (bodyError) return bodyError;

  try {
    const { id } = await params;
    const cpf = data.cpf !== undefined ? (data.cpf?.trim() || null) : undefined;

    if (cpf) {
      const existing = await prisma.customer.findFirst({
        where: { cpf, storeId: auth.storeId, NOT: { id } },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 });
      }
    }

    const customer = await prisma.customer.update({
      where: { id, storeId: auth.storeId },
      data: {
        ...(data.name    !== undefined && { name:    data.name?.trim() }),
        ...(data.phone   !== undefined && { phone:   data.phone?.trim() || null }),
        ...(data.email   !== undefined && { email:   data.email?.trim() || null }),
        ...(cpf          !== undefined && { cpf }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
        ...(data.notes   !== undefined && { notes:   data.notes?.trim() || null }),
      },
    });

    return NextResponse.json(customer);
  } catch (e) {
    return handlePrismaError(e, 'cliente');
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id } = await params;

    const pendingSales = await prisma.sale.count({
      where: { customerId: id, storeId: auth.storeId, paymentMethod: 'pending', paidAt: null },
    });

    if (pendingSales > 0) {
      return NextResponse.json(
        { error: 'Cliente possui vendas em aberto. Quite o saldo antes de excluir.' },
        { status: 409 },
      );
    }

    await prisma.customer.delete({ where: { id, storeId: auth.storeId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handlePrismaError(e, 'cliente');
  }
}
