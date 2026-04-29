import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { parseBody, createCustomerSchema } from '@/lib/validation/schemas';
import { handlePrismaError } from '@/lib/prisma-errors';

export async function GET(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const customers = await prisma.customer.findMany({
      where: { storeId: auth.storeId },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar clientes.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, createCustomerSchema);
  if (bodyError) return bodyError;

  try {
    const cpf = data.cpf?.trim() || null;

    if (cpf) {
      const existing = await prisma.customer.findFirst({
        where: { cpf, storeId: auth.storeId },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 409 });
      }
    }

    const customer = await prisma.customer.create({
      data: {
        storeId: auth.storeId,
        name:    data.name.trim(),
        phone:   data.phone?.trim() || null,
        email:   data.email?.trim() || null,
        cpf,
        address: data.address?.trim() || null,
        notes:   data.notes?.trim() || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (e) {
    return handlePrismaError(e, 'cliente');
  }
}
