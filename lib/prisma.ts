import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

// Normaliza sslmode para verify-full — evita warning de deprecação do pg v8
// e garante comportamento seguro equivalente ao libpq verify-full
const rawUrl = process.env.DATABASE_URL ?? '';
const connectionString = rawUrl
  .replace(/sslmode=prefer/g, 'sslmode=verify-full')
  .replace(/sslmode=require/g, 'sslmode=verify-full');

const adapter = new PrismaPg({ connectionString })

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma