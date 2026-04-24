import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const customers = await prisma.customer.findMany({
    where: { storeId: auth.storeId },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { name, phone, email, cpf, address, notes } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
  }

  if (cpf?.trim()) {
    const existing = await prisma.customer.findFirst({
      where: { cpf: cpf.trim(), storeId: auth.storeId },
    });
    if (existing) {
      return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 });
    }
  }

  const customer = await prisma.customer.create({
    data: {
      storeId: auth.storeId,
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      cpf: cpf?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
