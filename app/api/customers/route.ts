import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const { name, phone, email, cpf, address, notes } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
  }

  if (cpf?.trim()) {
    const existing = await prisma.customer.findUnique({ where: { cpf: cpf.trim() } });
    if (existing) {
      return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 });
    }
  }

  const customer = await prisma.customer.create({
    data: {
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
