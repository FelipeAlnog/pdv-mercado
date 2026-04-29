import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/generated/prisma/client';

type DomainLabel = 'produto' | 'cliente' | 'venda' | 'loja';

const LABELS: Record<DomainLabel, string> = {
  produto: 'Produto',
  cliente: 'Cliente',
  venda:   'Venda',
  loja:    'Loja',
};

export function handlePrismaError(e: unknown, domain: DomainLabel): NextResponse {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    const { code } = e;

    // P2002 — unique constraint violation
    if (code === 'P2002') {
      const target = (e.meta?.target as string[] | undefined) ?? [];
      if (target.some((f) => f.includes('barcode'))) {
        return NextResponse.json({ error: 'Código de barras já cadastrado.' }, { status: 409 });
      }
      if (target.some((f) => f.includes('cpf'))) {
        return NextResponse.json({ error: 'CPF/CNPJ já cadastrado.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Registro já cadastrado.' }, { status: 409 });
    }

    // P2025 — record not found
    if (code === 'P2025') {
      return NextResponse.json(
        { error: `${LABELS[domain]} não encontrado(a).` },
        { status: 404 },
      );
    }

    // P2003 — foreign key constraint
    if (code === 'P2003') {
      return NextResponse.json({ error: 'Referência inválida.' }, { status: 400 });
    }
  }

  return NextResponse.json({ error: `Erro ao processar ${domain}.` }, { status: 500 });
}
