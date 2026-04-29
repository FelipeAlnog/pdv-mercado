import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: session.user.id },
      select: { id: true, name: true, cpf: true, phone: true, address: true, plan: true },
    });
    if (!store) return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });
    return NextResponse.json(store);
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  try {
    const existing = await prisma.store.findUnique({ where: { ownerId: session.user.id } });
    if (existing) return NextResponse.json({ error: 'Loja já cadastrada.' }, { status: 409 });

    const { name, cpf, phone, address } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nome da loja é obrigatório.' }, { status: 400 });
    }
    if (!cpf?.trim()) {
      return NextResponse.json({ error: 'CPF/CNPJ é obrigatório.' }, { status: 400 });
    }

    const cpfTaken = await prisma.store.findUnique({ where: { cpf: cpf.trim() } });
    if (cpfTaken) {
      return NextResponse.json({ error: 'CPF/CNPJ já cadastrado.' }, { status: 409 });
    }

    const store = await prisma.store.create({
      data: {
        ownerId: session.user.id,
        name: name.trim(),
        cpf: cpf.trim(),
        phone: phone?.trim() || '',
        address: address?.trim() || '',
      },
      select: { id: true, name: true, cpf: true, phone: true, address: true, plan: true, logo: true },
    });
    return NextResponse.json(store, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  try {
    const { name, phone, address, logo } = await req.json();

    if (name !== undefined && !name?.trim()) {
      return NextResponse.json({ error: 'Nome da loja é obrigatório.' }, { status: 400 });
    }

    const store = await prisma.store.update({
      where: { ownerId: session.user.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() ?? '' }),
        ...(address !== undefined && { address: address?.trim() ?? '' }),
        ...(logo !== undefined && { logo: logo || null }),
      },
      select: { id: true, name: true, cpf: true, phone: true, address: true, plan: true, logo: true },
    });
    return NextResponse.json(store);
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar loja.' }, { status: 500 });
  }
}
