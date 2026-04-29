import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parseBody, createStoreSchema, updateStoreSchema } from '@/lib/validation/schemas';
import { handlePrismaError } from '@/lib/prisma-errors';

const STORE_SELECT = {
  id: true, name: true, cpf: true, phone: true, address: true, plan: true, logo: true,
} as const;

async function getSession(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return { session: null, unauth: NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }) };
  return { session, unauth: null };
}

export async function GET(req: NextRequest) {
  const { session, unauth } = await getSession(req);
  if (unauth) return unauth;

  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: session!.user.id },
      select: STORE_SELECT,
    });
    if (!store) return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });
    return NextResponse.json(store);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar loja.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, unauth } = await getSession(req);
  if (unauth) return unauth;

  const { data, error: bodyError } = await parseBody(req, createStoreSchema);
  if (bodyError) return bodyError;

  try {
    const existing = await prisma.store.findUnique({
      where: { ownerId: session!.user.id },
      select: { id: true },
    });
    if (existing) return NextResponse.json({ error: 'Loja já cadastrada.' }, { status: 409 });

    const cpf = data.cpf.trim();
    const cpfTaken = await prisma.store.findUnique({ where: { cpf }, select: { id: true } });
    if (cpfTaken) return NextResponse.json({ error: 'CPF/CNPJ já cadastrado.' }, { status: 409 });

    const store = await prisma.store.create({
      data: {
        ownerId: session!.user.id,
        name:    data.name.trim(),
        cpf,
        phone:   data.phone?.trim() ?? '',
        address: data.address?.trim() ?? '',
      },
      select: STORE_SELECT,
    });

    return NextResponse.json(store, { status: 201 });
  } catch (e) {
    return handlePrismaError(e, 'loja');
  }
}

export async function PATCH(req: NextRequest) {
  const { session, unauth } = await getSession(req);
  if (unauth) return unauth;

  const { data, error: bodyError } = await parseBody(req, updateStoreSchema);
  if (bodyError) return bodyError;

  try {
    const store = await prisma.store.update({
      where: { ownerId: session!.user.id },
      data: {
        ...(data.name    !== undefined && { name:    data.name?.trim() }),
        ...(data.phone   !== undefined && { phone:   data.phone?.trim() ?? '' }),
        ...(data.address !== undefined && { address: data.address?.trim() ?? '' }),
        ...(data.logo    !== undefined && { logo:    data.logo ?? null }),
      },
      select: STORE_SELECT,
    });
    return NextResponse.json(store);
  } catch (e) {
    return handlePrismaError(e, 'loja');
  }
}
