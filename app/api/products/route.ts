import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { parseBody, createProductSchema } from "@/lib/validation/schemas";
import { handlePrismaError } from "@/lib/prisma-errors";

export async function GET(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const products = await prisma.product.findMany({
      where: { storeId: auth.storeId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar produtos." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, createProductSchema);
  if (bodyError) return bodyError;

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        barcode: data.barcode ?? "",
        stock: data.stock,
        minStock: data.minStock,
        category: data.category ?? "",
        storeId: auth.storeId,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    return handlePrismaError(e, "produto");
  }
}
