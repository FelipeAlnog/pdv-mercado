import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id, storeId: auth.storeId } });
  if (!customer) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;
  const { name, phone, email, cpf, address, notes } = await req.json();

  if (name !== undefined && !name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
  }

  if (cpf?.trim()) {
    const existing = await prisma.customer.findFirst({
      where: { cpf: cpf.trim(), storeId: auth.storeId, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 });
    }
  }

  const customer = await prisma.customer.update({
    where: { id, storeId: auth.storeId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone.trim() || null }),
      ...(email !== undefined && { email: email.trim() || null }),
      ...(cpf !== undefined && { cpf: cpf.trim() || null }),
      ...(address !== undefined && { address: address.trim() || null }),
      ...(notes !== undefined && { notes: notes.trim() || null }),
    },
  });

  return NextResponse.json(customer);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

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
}
